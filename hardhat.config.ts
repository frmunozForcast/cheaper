import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";

require('hardhat-contract-sizer');
require('dotenv').config()
import "./tasks/deployFactory"

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
    demoDober: {
      url: "http://35.202.9.103:9555",
      accounts: 
        process.env.ACCOUNT_DMDOBER?.split(',')
    },
    hardhat: {
      accounts: {
        initialIndex: 0,
        count: 105,
      },
      hardfork: "london"
    }
  },
  etherscan: {
    apiKey: {
      goerli: process.env.GOERLI_PRIVATE_KEY
    }
  },
}