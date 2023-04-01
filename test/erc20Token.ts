import { ethers } from "hardhat";
import {expect } from "chai";
import "@nomiclabs/hardhat-web3";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ERC20Token", function () {

    async function deployToken(){
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();
        const tokenName = "TestAsset";
        const tokenSymbol = "TAT";

        const Token = await ethers.getContractFactory("erc20Token");
        const token = await Token.deploy(tokenName, tokenSymbol);

        return {token, owner, otherAccount}
    }

    describe("Deployment", function () {
        it("Should mint a total of 10000 tokens", async function () {
            const {token, owner, otherAccount} = await deployToken();
            const amount = ethers.BigNumber.from(10000);
            expect((await token.functions.totalSupply())[0].toString()).to.equal("0");
            await token.connect(owner)
                .functions.mint(owner.address, amount)
                .then ((res) => {
                    console.log("minted tokens");
                })
            expect((await token.functions.totalSupply())[0].toString()).to.equal(amount.toString());
            
        })
    })
})