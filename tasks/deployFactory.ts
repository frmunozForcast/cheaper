import { task } from "hardhat/config";
import fs from 'fs';

import * as path from 'path';
import { deployNew } from "./utils";

task("deployFactory", "deploy factory")
    .setAction(async (taskArgs, hre) =>{
        const accounts = await hre.ethers.getSigners();
        console.log("ACCOUNTS LENGTH:", accounts.length);
        let deployed = await deployNew(hre, "TokenFactory", [accounts[0].address], accounts[0]);
        console.log("deployed contract address:", deployed.address);
    })