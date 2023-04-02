const fs = require("fs");

// * web3
const Web3 = require("web3");
let web3 = new Web3();

const tokenFactoryAddress = ""
const abiPath = "/"  // to be specified

// - Tokens que ha creado
const queryCreatedTokens = async (userAddress) => {
    abi = JSON.parse(fs.readFileSync(abiPath + "TokenFactory.json"));
    let tfinst = new web3.eth.Contract(abi, tokenFactoryAddress);
    let tokensList = []
    await tfinst.getPastEvents("ERC20TokenCreated")
        .then(async (events) => {
            if (events.length > 0){
                for (let event of events){
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
    return tokenList
}

//- Tokens que ha puesto a la venta
const querySaleTokens = async (userAddress) => {
    abi = JSON.parse(fs.readFileSync(abiPath + "TokenFactory.json"));
    let tfinst = new web3.eth.Contract(abi, tokenFactoryAddress);
    let tokensForSale = [];
    await tfinst.getPastEvents("TokenForSale")
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
const queryAvailableTokens = async (userAddress, tokensForSale) => {
    abi = JSON.parse(fs.readFileSync(abiPath + "SaleMarket.json"));
    let availableTokens = {};
    for (let data of tokensForSale){
        let sminst = new web3.eth.Contract(abi, data.saleMarketAddress);
        await sminst
            .functions.getDetails()
            .then((res) => {
                availableTokens[data.tokenAddress] = res.totalTokensAvailable;
            })
    }
    return availableTokens;
}

// - Historial de ventas retail
const querySaleHistory = async (userAddress, tokensForSale) => {
    abi = JSON.parse(fs.readFileSync(abiPath + "SaleMarket.json"));
    let history = [];
    for (let data of tokensForSale){
        let sminst = new web3.eth.Contract(abi, data.saleMarketAddress);
        await sminst.getPastEvents("BuyRetail")
            .then((events) => {
                if (events.length > 0){
                    for (let event of events){
                        if (event.returnValues.owner == userAddress){
                            // save data of the token
                            history.push({
                                tokenAddress: data.tokenAddress,
                                buyer: event.returnValues.buyer,
                                amount: event.returnValues.amount,
                                commissioncharge: event.returnValues.commissioncharge,
                                price: event.returnValues.price,
                                date: event.returnValues.date,
                            })
                        }
                    }
                }
            })
    }
    // this list must be ordered by item "date" and "tokenAddress"
    return history;
}

// - Historial de ventas al por mayor


//-- Historial de compras

// -- cosas disponible a comprar