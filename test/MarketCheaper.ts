import { ethers } from "hardhat";
import {expect } from "chai";
import "@nomiclabs/hardhat-web3";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ERC20Token", function () {

    async function deployToken(){
        // Contracts are deployed using the first signer/account by default
        const tokenName = "TestAsset";
        const tokenSymbol = "TAT";

        const Token = await ethers.getContractFactory("erc20Token");
        const token = await Token.deploy(tokenName, tokenSymbol);

        return {token}
    }

    async function deployMarketCheaper(owner: string){
        const commissionFee = 3; // 3%

        const MarketCheaper = await ethers.getContractFactory("MarketCheaper");
        const marketCheaper = await MarketCheaper.deploy(owner, commissionFee);

        return {marketCheaper}
    }

    describe("Deployment", function () {
        it("Set sale properties for one specific token", async function () {
            const [owner, otherAccount] = await ethers.getSigners();
            const {token} = await deployToken();
            const {marketCheaper} = await deployMarketCheaper(owner.address);
            const salePrice = ethers.utils.parseUnits("0.01", "ether");
            const unitToken = ethers.BigNumber.from(100);

            await marketCheaper.connect(owner)
                .functions.setSaleProperties(
                    token.address, salePrice, unitToken)
                .then((res) => {
                    console.log("configured sale properties!")
                });

            await marketCheaper.queryFilter(marketCheaper.filters.saleProperty())
                .then((res) => {
                    if (res.length > 0){
                        console.log("found", res.length, "events saleOProperty");
                        for (let i = 0; i < res.length; i++){
                            console.log("checking event", i+1, "of", res.length);
                            expect(res[i].args.price.toString()).to.equal(salePrice.toString())
                            expect(res[i].args.token).to.equal(token.address)
                            expect(res[i].args.seller).to.equal(owner.address)
                            expect(res[i].args.unit.toString()).to.equal(unitToken.toString())
                        }
                    } else {
                        console.log("No events saleProperty found!!")
                    }
                })
            // check also the getter
            await marketCheaper.connect(owner)
                .functions.getSaleProperties(token.address, owner.address)
                .then( (res) => {
                    console.log("checking getter getSaleProperties returns")
                    expect(res.price.toString()).to.equal(salePrice.toString())
                    expect(res.minUnit.toString()).to.equal(unitToken.toString())
                })
        })
        it("set sale, buy token, check final", async function (){
            console.log("pending test")
        })
    })
})