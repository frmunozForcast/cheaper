import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
require('hardhat-deploy');

require('hardhat-contract-sizer');
require('dotenv').config({path: '.env'});

import "./tasks/deployFactory"
import "./tasks/accounts"

const config: HardhatUserConfig = {
  solidity: "0.8.18",
};

export default config;

module.exports = {
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10,
      },
      outputSelection: {
        "*": {
          "*": [
            "abi",
            "evm.bytecode",
            "evm.deployedBytecode",
            "metadata"
          ]
        },
      },
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [],
  },
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: process.env.ACCOUNT_CELO?.split(','),
      chainId: 44787
    }
  }
}