const fs = require("fs");

// * web3
const Web3 = require("web3");
let web3 = new Web3();

const tokenFactoryAddress = "0x963D8CE362599Dc8150B22a5FD544843AC3A270d"
const abiPath = "./abi/"
const RPC = "http://35.202.9.103:9555"

function singUser(privateKey, messageSing = "sing user") {
    web3.eth.accounts.sign(messageSing, privateKey);
    let objectOut = web3.eth.accounts.privateKeyToAccount(privateKey);
    return {
        address: objectOut.address,
        privateKey: objectOut.privateKey
    };
}

const getAccounts = async(env_process) => {
    let accounts = []
    for (let [i, accountKey] of env_process.ACCOUNT_DMDOBER.split(',').entries()){
        // * sign in
        accounts.push(singUser(accountKey));
    }
    return accounts;
}

// FOR TESTING 
const deployToken = async (user) => {
    let abi = JSON.parse(fs.readFileSync(abiPath + "TokenFactory.json"));
    let tfinst = new web3.eth.Contract(abi, tokenFactoryAddress);

    let estimateGas;
    let ok = true;
    await tfinst.methods
        .deployNewERC20Token("testTokenB", "TTB", "10000")
        .estimateGas({from: user.address})
        .then(function(gasAmount){
            console.log("gas estimante :", gasAmount);
            estimateGas = gasAmount;
        }).catch(function(err){
            console.error("gas estimate :", err);
            ok = false;
        });
    console.log("estimate gas", ok, estimateGas);
    if (ok){
        let txData = {
            from: user.address,
            to: tfinst._address,
            gas: estimateGas,
            data: tfinst.methods.deployNewERC20Token("testTokenB", "TTB", "10000").encodeABI()
        }
        await web3.eth.accounts.signTransaction(txData, user.privateKey)
            .then(async (signature) => {
                await web3.eth.sendSignedTransaction(signature.rawTransaction)
                    .then(async (txresponse) => {
                        console.log("txResponse", txresponse);
                    })
                    .catch((err) => {
                        console.error("Send :", err);
                        ok = false;
                    });
            }).catch( (err) => {
                console.error("Sign :", err);
                ok = false;
            });
    }
}

const putForSale = async (user, tokenAddress, retailPrice, wholeSalePrice, goal) => {
    let abi = JSON.parse(fs.readFileSync(abiPath + "TokenFactory.json"));
    let tfinst = new web3.eth.Contract(abi, tokenFactoryAddress);
    console.log(retailPrice, wholeSalePrice, goal);
    let estimateGas;
    let ok = true;

    await tfinst.methods
        .putTokenForSale(tokenAddress, goal, wholeSalePrice, retailPrice)
        .estimateGas({from: user.address})
        .then(function(gasAmount){
            console.log("gas estimante :", gasAmount);
            estimateGas = gasAmount;
        }).catch(function(err){
            console.error("gas estimate :", err);
            ok = false;
        });
    console.log("estimate gas", ok, estimateGas);
    if (ok){
        let txData = {
            from: user.address,
            to: tfinst._address,
            gas: estimateGas,
            data: tfinst.methods.putTokenForSale(tokenAddress, goal, wholeSalePrice, retailPrice).encodeABI()
        }
        await web3.eth.accounts.signTransaction(txData, user.privateKey)
            .then(async (signature) => {
                await web3.eth.sendSignedTransaction(signature.rawTransaction)
                    .then(async (txresponse) => {
                        console.log("txResponse", txresponse);
                    })
                    .catch((err) => {
                        console.error("Send :", err);
                        ok = false;
                    });
            }).catch( (err) => {
                console.error("Sign :", err);
                ok = false;
            });
    }
}

// - Tokens que ha creado
const queryCreatedTokens = async (userAddress, startBlock) => {
    let abi = JSON.parse(fs.readFileSync(abiPath + "TokenFactory.json"));
    let tfinst = new web3.eth.Contract(abi, tokenFactoryAddress);
    let tokensList = []
    await tfinst.getPastEvents("ERC20TokenCreated", {fromBlock: startBlock})
        .then(async (events) => {
            if (events.length > 0){
                console.log("found", events.length, "events");
                for (let event of events){
                    console.log("event owner", event.returnValues.owner)
                    if (event.returnValues.owner == userAddress){
                        // save data of the token
                        tokensList.push({
                            tokenAddress: event.returnValues.tokenAddress,
                            tokenName: event.returnValues.name,
                            tokenSymbol: event.returnValues.symbol,
                            date: event.returnValues.date
                        })
                    }
                }
            }
        })
    return tokensList
}

//- Tokens que ha puesto a la venta
const querySaleTokens = async (userAddress, startBlock) => {
    let abi = JSON.parse(fs.readFileSync(abiPath + "TokenFactory.json"));
    let tfinst = new web3.eth.Contract(abi, tokenFactoryAddress);
    let tokensForSale = [];
    await tfinst.getPastEvents("TokenForSale", {fromBlock: startBlock})
        .then(async (events) => {
            if (events.length > 0){
                for (let event of events){
                    if (event.returnValues.owner == userAddress){
                        // save data of the token
                        tokensForSale.push({
                            tokenAddress: event.returnValues.tokenAddress,
                            saleMarketAddress: event.returnValues.saleMarketAddress,
                            retailPrice: event.returnValues.retailPrice,
                            wholeSalePrice: event.returnValues.wholeSalePrice,
                            wholeSaleGoal: event.returnValues.wholeSaleGoal,
                            date: event.returnValues.date
                        })
                    }
                }
            }
        })
    return tokensForSale;
}

// - Cantidad de cada uno disponible
const queryAvailableQuantityTokens = async (tokensForSale) => {
    let abi = JSON.parse(fs.readFileSync(abiPath + "SaleMarket.json"));
    let availableTokens = {};
    for (let data of tokensForSale){
        let sminst = new web3.eth.Contract(abi, data.saleMarketAddress);
        await sminst
            .methods.getDetails().call()
            .then((res) => {
                availableTokens[data.tokenAddress] = res.totalTokensAvailable;
            })
    }
    return availableTokens;
}

// - Historial de ventas retail
// genera el historial de ventas para la lista de ordenes de venta asociadas
// a un usuario
const querySaleHistory = async (userAddress, startBlock) => {
    let tokensForSale = await querySaleTokens(userAddress, startBlock);
    let abi = JSON.parse(fs.readFileSync(abiPath + "SaleMarket.json"));
    let history = [];
    for (let data of tokensForSale){
        let sminst = new web3.eth.Contract(abi, data.saleMarketAddress);
        await sminst.getPastEvents("BuyRetail", {fromBlock: startBlock})
            .then((events) => {
                if (events.length > 0){
                    for (let event of events){
                        // save data
                        history.push({
                            tokenAddress: data.tokenAddress,
                            owner: userAddress,
                            buyer: event.returnValues.buyer,
                            amount: event.returnValues.amount,
                            commissioncharge: event.returnValues.commissioncharge,
                            price: event.returnValues.price,
                            date: event.returnValues.date,
                        })
                    }
                }
            })
    }
    // this list must be ordered by item "date" and "tokenAddress"
    return history;
}

// - Historial de ventas al por mayor
// genera el historial de ventas al por layor para la lista de ordenes de venta
// asociadas a un usuario
const queryWholeSaleHistory = async (userAddress, startBlock) => {
    let tokensForSale = await querySaleTokens(userAddress, startBlock);
    let abi = JSON.parse(fs.readFileSync(abiPath + "SaleMarket.json"));
    let history = [];
    for (let data of tokensForSale){
        let sminst = new web3.eth.Contract(abi, data.saleMarketAddress);
        await sminst.getPastEvents("ExecuteWholeSale", {fromBlock: startBlock})
            .then((events) => {
                if (events.length > 0){
                    for (let event of events){
                        // save data
                        history.push({
                            tokenAddress: data.tokenAddress,
                            owner: userAddress,
                            amountSale: event.returnValues.amountSale,
                            commissioncharge: event.returnValues.commissioncharge,
                            price: event.returnValues.price,
                            date: event.returnValues.date,
                        })
                    }
                }
            })
    }
    // this list must be ordered by item "date" and "tokenAddress"
    return history;
}


//-- Historial de compras

const queryBuyHistory = async (userAddress, startBlock) => {
    let tokensBought = []
    let abi = JSON.parse(fs.readFileSync(abiPath + "TokenFactory.json"));
    let tokenAbi = JSON.parse(fs.readFileSync(abiPath + "ERC20Token.json"));
    let smAbi = JSON.parse(fs.readFileSync(abiPath + "SaleMarket.json"));
    let tfinst = new web3.eth.Contract(abi, tokenFactoryAddress);
    await tfinst.getPastEvents("TokenForSale", {fromBlock: startBlock})
        .then(async (events) => {
            if (events.length > 0){
                console.log("found", events.length, "TokenForSale");
                for (let event of events){
                    // for each token, check Transfer events where "to" is the current user
                    let tokenInst = new web3.eth.Contract(tokenAbi, event.returnValues.tokenAddress);
                    await tokenInst.getPastEvents("Transfer", {fromBlock: startBlock})
                        .then(async (transferEvents) => {
                            if (transferEvents.length > 0){
                                console.log("found", transferEvents.length, "Transfer");
                                for (let tevent of transferEvents){
                                    if (tevent.returnValues.to == userAddress){
                                        // add token address to list
                                        if (!tokensBought.includes(event.returnValues.tokenAddress)){
                                            tokensBought.push(event.returnValues.tokenAddress);
                                        }
                                    }
                                }
                            }
                        })
                }
            }
        })
    console.log("--> user as bought from", tokensBought.length, "tokens");
    // then retrieve matching buys for that specific list of tokens
    let buyHistory = []
    for (let tokenAddr of tokensBought){
        let smInst = new web3.eth.Contract(smAbi, tokenAddr);
        await smInst.getPastEvents("BuyRetail", {fromBlock: startBlock})
            .then(async (events) => {
                console.log("found", events.length, "BuyRetail");
                if (events.length > 0){
                    for (let event of events){
                        if (event.returnValues.buyer == userAddress){
                            buyHistory.push({
                                tokenAddress: tokenAddr,
                                tokenOwner: event.returnValues.seller,
                                buyPrice: event.returnValues.price,
                                totalPay: event.returnValues.amount,
                                tokensAdquired: event.returnValues.tokens,
                                date: +event.returnValues.date,
                                wasRetail: true
                            })
                        }
                    }
                }
            })
        await smInst.getPastEvents("ExecutedBuyWholeSale", {fromBlock: startBlock})
            .then(async (events) => {
                if (events.length > 0){
                    console.log("found", events.length, "events");
                    for (let event of events){
                        if (event.returnValues.buyer == userAddress){
                            buyHistory.push({
                                tokenAddress: tokenAddr,
                                tokenOwner: event.returnValues.seller,
                                buyPrice: event.returnValues.price,
                                totalPay: event.returnValues.amount,
                                tokensAdquired: event.returnValues.tokens,
                                date: +event.returnValues.date,
                                wasRetail: false
                            })
                        }
                    }
                }
            })
    }
    return buyHistory;

}

// -- cosas disponible a comprar
const queryAvailableTokensToBuy = async (startBlock) => {
    let abi = JSON.parse(fs.readFileSync(abiPath + "TokenFactory.json"));
    let tfinst = new web3.eth.Contract(abi, tokenFactoryAddress);
    let tokensForSale = [];
    await tfinst.getPastEvents("TokenForSale", {fromBlock: startBlock})
        .then(async (events) => {
            if (events.length > 0){
                for (let event of events){
                    // save data
                    tokensForSale.push({
                        tokenAddress: event.returnValues.tokenAddress,
                        tokenOwner: event.returnValues.owner,
                        saleMarketAddress: event.returnValues.saleMarketAddress,
                        retailPrice: event.returnValues.retailPrice,
                        wholeSalePrice: event.returnValues.wholeSalePrice,
                        wholeSaleGoal: event.returnValues.wholeSaleGoal,
                        date: event.returnValues.date
                    })
                }
            }
        })
    return tokensForSale;
}

const main = async () => {
    console.log("setting provider")
    web3.setProvider(new web3.providers.HttpProvider(RPC));
    console.log("getting accounts")
    // console.log("process", process.env);
    let accounts = await getAccounts(process.env);
    console.log("accounts", accounts);

    // -------------
    // console.log("deploy test token");
    // await deployToken(accounts[1]);
    // --------------

    // specify block so it does not take too much time, we know that no events can be found
    // before block 35300;
    let startBlock = 35300;
    let tokenList = await queryCreatedTokens(accounts[1].address, startBlock);
    console.log("tokenList", tokenList);

    //--------------------
    // put for sale (ONLY TEST)
    // let retailPrice = web3.utils.toBN(web3.utils.toWei("0.05"))
    // let wholesalePrice = web3.utils.toBN(web3.utils.toWei("0.045"))
    // let goal = wholesalePrice.mul(web3.utils.toBN(500))
    // await putForSale(
    //     accounts[1], tokenList[1].tokenAddress, 
    //     retailPrice.toString(), 
    //     wholesalePrice.toString(), 
    //     goal.toString());
    //--------------------
    let tokensForSale = await querySaleTokens(accounts[1].address, startBlock);
    console.log("tokensForSale", tokensForSale);

    // others queris could be used here too but they wont give any result since we havent done
    // more transactions in deploy

    let availableQuantityTokens = await queryAvailableQuantityTokens(tokensForSale);
    console.log("availableQuantityTokens", availableQuantityTokens)

    let retailSaleHistory = await querySaleHistory(accounts[1].address, startBlock);
    console.log("retailSaleHistory", retailSaleHistory);
    let wholeSaleHistory = await queryWholeSaleHistory(accounts[1].address, startBlock);
    console.log("wholeSaleHistory", wholeSaleHistory);


    // this query includes retail buys and wholesale buys
    let buyHistory = await queryBuyHistory(accounts[2].address, startBlock);
    console.log("buyHistory", buyHistory);

    let availableTokensTobuy = await queryAvailableTokensToBuy(startBlock);
    console.log("availableTokensTobuy", availableTokensTobuy);
}


main()
    .then(async (res) => {
        console.log("End of request >>>");
    })
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });