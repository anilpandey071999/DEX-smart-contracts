// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { ethers } from "hardhat";
import { WETH9__factory, WETH9, KyotoSwapFactory__factory, KyotoSwapFactory } from "../typechain-types";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  // const WBNBFactory = (await ethers.getContractFactory("WETH9")) as WETH9__factory;
  // const wbnb = (await WBNBFactory.deploy()) as WETH9;
  // console.log(`WBNB ADDRESS: ${wbnb.address}`);

  const KyotoSwapFactoryFactory = (await ethers.getContractFactory("KyotoSwapFactory")) as KyotoSwapFactory__factory;
  const kyotoswapFactory = (await KyotoSwapFactoryFactory.deploy(process.env.FEE_TO_SETTER as string)) as KyotoSwapFactory;

  await kyotoswapFactory.deployed();

  console.log(`kyotoswapFactory: ${kyotoswapFactory.address}`);
  console.log(`INIT_CODE_PAIR_HASH: ${await kyotoswapFactory.INIT_CODE_PAIR_HASH()}`);
  console.info("Before Deploying the Router, Copy INIT_CODE_PAIR_HASH code past it in side kyotoswapLibrary at line number 24");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
