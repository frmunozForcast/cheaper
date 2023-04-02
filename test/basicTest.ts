import { ethers } from "hardhat";
import {expect } from "chai";
import "@nomiclabs/hardhat-web3";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("basic test operation", function () {
    async function deployFactory(commissionAddress){
        // Contracts are deployed using the first signer/account by default
        const tokenName = "TestAsset";
        const tokenSymbol = "TAT";

        const TokenFactory = await ethers.getContractFactory("TokenFactory");
        const tf = await TokenFactory.deploy(commissionAddress);

        return {tf}
    }
    describe("retail", function () {
        it ("create->public->retail", async function (){
            const accounts = await ethers.getSigners();
            const {tf} = await deployFactory(accounts[0].address);
            const tokenName = "testToken"
            const tokenSymbol = "TTN"
            const initialAmount = ethers.BigNumber.from(1000)
            const goal = ethers.BigNumber.from(500)
            const retailPrice = ethers.utils.parseUnits("0.05", "ether")
            const wholeSalePrice = ethers.utils.parseUnits("0.045", "ether")
            const buyRetailAmount = ethers.utils.parseUnits("5", "ether")
            let txResponse = await tf.connect(accounts[1])
                .functions.deployNewERC20Token(tokenName, tokenSymbol, initialAmount)
            let txReceipt = await txResponse.wait();
            let tokenAddress = txReceipt.events[1].args["tokenAddress"];
            console.log("tokenAddress", tokenAddress);
            txResponse = await tf.connect(accounts[1])
                .functions.putTokenForSale(tokenAddress, goal, wholeSalePrice, retailPrice);
            txReceipt = await txResponse.wait();
            // console.log("txReceipt", txReceipt);
            let smAddress = txReceipt.events[0].args["saleMarketAddress"];
            console.log("smAddress", smAddress);

            // buy token
            let smInst = await ethers.getContractAt("SaleMarket", smAddress);
            let token = await ethers.getContractAt("ERC20Token", tokenAddress);

            
            await token.connect(accounts[1])
                .functions.approve(smInst.address, initialAmount)

            await token.connect(accounts[1])
                .functions.allowance(accounts[1].address, smInst.address)
                .then((res) => {
                    console.log("allowance", res);
                })

            // console.log(await smInst.functions.getDetails());
            console.log("balance before:", await token.connect(accounts[0]).balanceOf(accounts[2].address));
            txResponse = await smInst.connect(accounts[2])
                .functions.buyRetail({value: buyRetailAmount.toString()})
            txReceipt = await txResponse.wait()
            console.log("balance after:", await token.connect(accounts[0]).balanceOf(accounts[2].address));
            expect((await token.connect(accounts[0]).balanceOf(accounts[2].address)).toString()).to.equal("100");
        })
    })

    describe("wholesale", function () {
        it("create->public->buyOption->buyOption->buyOption->execute", async function () {
            const accounts = await ethers.getSigners();
            const {tf} = await deployFactory(accounts[0].address);
            const tokenName = "testToken"
            const tokenSymbol = "TTN"
            const initialAmount = ethers.BigNumber.from(1000)
            const retailPrice = ethers.utils.parseUnits("0.05", "ether")
            const wholeSalePrice = ethers.utils.parseUnits("0.045", "ether")
            const goal = wholeSalePrice.mul(500)
            const buyOptions = [
                wholeSalePrice.mul(10),
                wholeSalePrice.mul(150),
                wholeSalePrice.mul(345)
            ]
            const buyStartId = 2;

            // deploy token for sale
            let txResponse = await tf.connect(accounts[1])
                .functions.deployNewERC20Token(tokenName, tokenSymbol, initialAmount)
            let txReceipt = await txResponse.wait();
            let tokenAddress = txReceipt.events[1].args["tokenAddress"];
            console.log("tokenAddress", tokenAddress);
            txResponse = await tf.connect(accounts[1])
                .functions.putTokenForSale(tokenAddress, goal, wholeSalePrice, retailPrice);
            txReceipt = await txResponse.wait();
            // console.log("txReceipt", txReceipt);
            let smAddress = txReceipt.events[0].args["saleMarketAddress"];
            console.log("smAddress", smAddress);
            
            // aprove allowance for sale
            let smInst = await ethers.getContractAt("SaleMarket", smAddress);
            let token = await ethers.getContractAt("ERC20Token", tokenAddress);
            await token.connect(accounts[1])
                .functions.approve(smInst.address, initialAmount)
            await token.connect(accounts[1])
                .functions.allowance(accounts[1].address, smInst.address)
                .then((res) => {
                    console.log("allowance", res);
                })

            // buy options for whole sale
            
            for (let i = 0; i < buyOptions.length; i++){
                let acc = accounts[buyStartId+i];
                let amount = buyOptions[i];
                console.log(buyStartId+i, acc.address, amount.toString());
                txResponse = await smInst.connect(acc)
                    .functions.buyWholeSale({value: amount.toString()})
                txReceipt = await txResponse.wait()
                console.log("txReceipt", txReceipt.events[0].args);
                console.log("getDepositAmount", await smInst.connect(acc).functions.getDepositAmount());
            }
            console.log("================================")
            console.log("getDetails", await smInst.functions.getDetails());
            txResponse = await smInst.connect(accounts[1])
                .functions.executeWholeSale()
            txReceipt = await txResponse.wait()

            for (let i = 0; i < buyOptions.length; i++){
                let acc = accounts[buyStartId+i];
                let realTokenAmount = await token.connect(acc).balanceOf(acc.address);
                let expectTokenAmount = buyOptions[i].div(wholeSalePrice).toString();
                console.log(
                    "balance of acc", buyStartId+i, ":", 
                    realTokenAmount)
                expect(realTokenAmount.toString()).to.equal(expectTokenAmount);
            }

        })
    })
})