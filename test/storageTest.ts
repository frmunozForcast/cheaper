import { ethers } from "hardhat";
import {expect } from "chai";
import "@nomiclabs/hardhat-web3";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { token } from "../typechain-types/@openzeppelin/contracts";
import {Signer} from "ethers";

describe("basic test operation", function () {
    async function deployFactory(commissionAddress: string){
        // Contracts are deployed using the first signer/account by default

        const TokenFactory = await ethers.getContractFactory("TokenFactory");
        const tf = await TokenFactory.deploy(commissionAddress);

        return {tf}
    }

    it ("store some random string and get it", async function () {
        const accounts = await ethers.getSigners();
        const {tf} = await deployFactory(accounts[0].address);
        const tokenName = "testToken"
        const tokenSymbol = "TTN"
        const initialAmount = ethers.BigNumber.from(1000);
        const storageKey = "randomString";
        const storageValue = "randomValue";

        // deploy new ERC20 token, representing a product
        let txResponse = await tf.connect(accounts[1])
            .functions.deployNewERC20Token(tokenName, tokenSymbol, initialAmount)
        let txReceipt = await txResponse.wait();
        // get the deployed erc20 contract address and instanciate it
        let tokenAddress = txReceipt.events[1].args["tokenAddress"];
        let token = await ethers.getContractAt("ERC20Token", tokenAddress);

        // get the stored string before set, should be empty
        let stored = await token.connect(accounts[3])
            .functions.getString(storageKey)
        console.log("stored value before set:", stored);
        expect(stored[0]).to.equal("");
        
        // store the string value in the contract
        await token.connect(accounts[1])
            .functions.setString(storageKey, storageValue);

        // get the stored string after set, should be te expected string value
        stored = await token.connect(accounts[3])
            .functions.getString(storageKey)
        console.log("stored value after set:", stored);
        expect(stored[0]).to.equal(storageValue);

        // delete the stored string value by its key
        await token.connect(accounts[1])
            .functions.deleteString(storageKey);
        
        // check that the stored string value was deleted
        stored = await token.connect(accounts[3])
            .functions.getString(storageKey)
        console.log("stored value after delete:", stored);
        expect(stored[0]).to.equal("");
    })
})