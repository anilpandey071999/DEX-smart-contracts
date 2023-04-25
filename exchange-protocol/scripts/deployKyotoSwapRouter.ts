// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { ethers } from "hardhat";
import { KyotoSwapRouter, KyotoSwapRouter__factory } from "../typechain-types";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  // const[owner] = await ethers.getSigners()
  // console.log(await owner.getBalance(), await owner.address);
  
  
  const KyotoSwapRouterFactory = (await ethers.getContractFactory("KyotoSwapRouter")) as KyotoSwapRouter__factory;
  const kyotoswapRouter = (await KyotoSwapRouterFactory.deploy(process.env.KYOTOSWAPFACTORY_ADDRESS as string, process.env.WBNB_ADDRESS as string)) as KyotoSwapRouter;
  // console.log("TX HASH: ", kyotoswapRouter);
  
  console.log("Kyoto Swap Router Address is ",kyotoswapRouter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
