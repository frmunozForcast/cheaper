const fs = require("fs");

// * web3
const Web3 = require("web3");
let web3 = new Web3();

require('dotenv').config();

// const tokenFactoryAddress = "0x742eD6480099E048A073f2A9d3BdA21e7185Dd8B";
const abiPath = "./abi/";

/**
 * THIS SCRIPT SHOULD ONLY BE RUN ONCE PER NEW DEPLOY OF FACTORY
 * AND IS INTENDED TO PRODUCE BASIC EVENTS FOR LATER TESTING QUERIES
 * WITH queries.js SCRIPT
 * 
 */

function singUser(privateKey, messageSing = "sing user") {
    web3.eth.accounts.sign(messageSing, privateKey);
    let objectOut = web3.eth.accounts.privateKeyToAccount(privateKey);
    return {
        address: objectOut.address,
        privateKey: objectOut.privateKey
    };
}

function factoryAddress() {
    return process.env.FACTORY_ADDRESS
}

const getAccounts = async(env_process) => {
    let accounts = []
    for (let [i, accountKey] of env_process.ACCOUNT_TEST.split(',').entries()){
        // * sign in
        accounts.push(singUser(accountKey));
    }
    return accounts;
}

// - Tokens que ha creado
const queryCreatedTokens = async (userAddress, startBlock) => {
    let abi = JSON.parse(fs.readFileSync(abiPath + "TokenFactory.json"));
    let tfinst = new web3.eth.Contract(abi, factoryAddress());
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

const deployToken = async (user) => {
    let abi = JSON.parse(fs.readFileSync(abiPath + "TokenFactory.json"));
    let tfinst = new web3.eth.Contract(abi, factoryAddress());

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
    let tfinst = new web3.eth.Contract(abi, factoryAddress());
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

const main = async () => {
    console.log("setting provider")
    web3.setProvider(new web3.providers.HttpProvider(process.env.RPC));
    console.log("getting accounts")
    console.log("process", process.env);
    let accounts = await getAccounts(process.env);
    console.log("accounts", accounts);

    console.log("deploy test token");
    await deployToken(accounts[1]);
    let startBlock = 0;
    let tokenList = await queryCreatedTokens(accounts[1].address, startBlock);
    console.log("tokenList", tokenList);

    // put for sale (ONLY TEST)
    let retailPrice = web3.utils.toBN(web3.utils.toWei("0.005"))
    let wholesalePrice = web3.utils.toBN(web3.utils.toWei("0.0045"))
    let goal = wholesalePrice.mul(web3.utils.toBN(500))
    await putForSale(
        accounts[1], tokenList[tokenList.length-1].tokenAddress, 
        retailPrice.toString(), 
        wholesalePrice.toString(), 
        goal.toString());
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