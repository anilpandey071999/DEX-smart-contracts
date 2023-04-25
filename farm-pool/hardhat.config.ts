import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings:{
          optimizer: {
            enabled : true,
            runs: 1000
          }
        }
      },
      {
        version: "0.8.4",
        settings:{
          optimizer: {
            enabled : true,
            runs: 1000
          }
        }
      },
      {
        version: "0.7.0",
        settings:{
          optimizer: {
            enabled : true,
            runs: 1000
          }
        }
      },
      {
        version: "0.8.0",
        settings:{
          optimizer: {
            enabled : true,
            runs: 1000
          }
        }
      },
      {
        version: "0.5.16",
        settings:{
          optimizer: {
            enabled : true,
            runs: 1000
          }
        }
      },
      {
        version: "0.5.0",
        settings:{
          optimizer: {
            enabled : true,
            runs: 1000
          }
        }
      },
      {
        version: "0.5.1",
        settings:{
          optimizer: {
            enabled : true,
            runs: 1000
          }
        }
      },
      {
        version: "0.6.12",
        settings:{
          optimizer: {
            enabled : true,
            runs: 1000
          }
        }
      },
      {
        version: "0.6.6",
        settings:{
          optimizer: {
            enabled : true,
            runs: 1000
          }
        }
      },
      {
        version: "0.4.18",
        settings:{
          optimizer: {
            enabled : true,
            runs: 1000
          }
        }
      },
    ]
  },
  networks: {
    bsc_testnet: {
      url: "https://data-seed-prebsc-1-s3.binance.org:8545	",
      accounts: [process.env.TESTNET_OWNER_PRIVATE_KEY as string],
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org",
      accounts: [process.env.OWNER_PRIVATE_KEY as string],
    },
  },etherscan: {
    apiKey: "P3GTQKZUVHGXVM2NWGJZ2X6SH1B11KS1HY"
  }
};

export default config;
