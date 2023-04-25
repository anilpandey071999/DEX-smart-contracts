// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
//const { ethers, upgrades } = require("hardhat");
import { ethers, upgrades } from "hardhat";
import { KSFeeHandler, KSFeeHandler__factory } from "../typechain-types";
import dotenv from "dotenv";
dotenv.config();

const { KSWAP_ADDRESS, KYOTOSWAPROUTER_ADDRESS,OWNER_ADDRESS, VAULT_ADDRESS, BURNWALLET_ADDRESS, BUSD_ADDRESS, WBNB_ADDRESS } = process.env;
const { TESTNET_KSWAP_ADDRESS, TESTNET_KYOTOSWAPROUTER_ADDRESS,TESTNET_OWNER_ADDRESS, TESTNET_VAULT_ADDRESS, TESTNET_BURNWALLET_ADDRESS, TESTNET_BUSD_ADDRESS, TESTNET_WBNB_ADDRESS } = process.env;

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const KSFeeHandlerFactory = (await ethers.getContractFactory("KSFeeHandler")) as KSFeeHandler__factory;

  const ksFeeHandlerlProxy = (await upgrades.deployProxy(KSFeeHandlerFactory, [KSWAP_ADDRESS, KYOTOSWAPROUTER_ADDRESS, OWNER_ADDRESS, BURNWALLET_ADDRESS, VAULT_ADDRESS, 62500, [KSWAP_ADDRESS, BUSD_ADDRESS, WBNB_ADDRESS]], {
    kind: "uups",
    initializer: "initialize",
  })) as KSFeeHandler;
  // const ksFeeHandlerlProxy = (await upgrades.deployProxy(KSFeeHandlerFactory, [TESTNET_KSWAP_ADDRESS, TESTNET_KYOTOSWAPROUTER_ADDRESS, TESTNET_OWNER_ADDRESS, TESTNET_BURNWALLET_ADDRESS, TESTNET_VAULT_ADDRESS, 62500, [TESTNET_KSWAP_ADDRESS, TESTNET_BUSD_ADDRESS, TESTNET_WBNB_ADDRESS]], {
  //   kind: "uups",
  //   initializer: "initialize",
  // })) as KSFeeHandler;
  await ksFeeHandlerlProxy.deployed();
  console.log("KS Fee Handler deployed to:", ksFeeHandlerlProxy.address);
  console.log("Proxy Implementation Address ", await upgrades.erc1967.getImplementationAddress(ksFeeHandlerlProxy.address));

  // We get the contract to deploy
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
