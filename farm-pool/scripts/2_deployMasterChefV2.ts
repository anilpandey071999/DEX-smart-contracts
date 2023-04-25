import { KSwapToken, MasterChef, MasterChefV2__factory, MasterChefV2, MockBEP20__factory, MockBEP20 } from "../typechain-types";
import { ethers } from "hardhat";
import dotenv from "dotenv";
dotenv.config();

/* 
----------------------------Deployment Sequence----------------------------
                -> First Deploy KSwapTokenAndDeploy.ts file in scripts floder
                -> Once you runned KSwapTokenAndDeploy.ts then run Masterv2Deploy.ts file in smae folder
                -> Now by Running  KSwapTokenAndDeploy.ts and Masterv2Deploy.ts we will get the address of Kswap token, syrup token, masterv1, dummymasterchef token, masterchedfv2
                -> Once you got all the address of the conttracts address please after running each file all the address you have got from the in console copy it and paste to the contractAddress.json file
                -> when you are done by running about file then run AfterMV2.ts file it will do all the neccery task for deplloying kswapPool contract and over here you will also get Dummykswap pool token
                -> lasetly you have to run KswapPoolDeploy.ts file by which we will be done with deployment of farms
                
                => KSwapTokenAndDeploy.ts
                => Masterv2Deploy.ts
                => AfterMV2.ts
                => KswapPoolDeploy.ts
*/
async function main() {
  const [dev] = await ethers.getSigners();
  
  const MockBEP20: MockBEP20__factory = await ethers.getContractFactory("MockBEP20") as MockBEP20__factory;
  const mockBEP20: MockBEP20 = await MockBEP20.deploy("DummyMasterchefV2Token", "DMV2T");
  console.log('"MasterchefDummyToken":', `"${mockBEP20.address}",`);

  const masterChef: MasterChef = await ethers.getContractAt("MasterChef", process.env.MASTERCHEF as string, dev) as MasterChef;
  const kswap: KSwapToken = await ethers.getContractAt("KSwapToken", process.env.KSWAP as string, dev) as KSwapToken;
  console.log("---------Adding Dummy token Farm in MasterchefV1----------");
  await masterChef.add("200", mockBEP20.address, true);

  const MasterChefV2: MasterChefV2__factory = await ethers.getContractFactory("MasterChefV2") as MasterChefV2__factory;
  const masterChefV2: MasterChefV2 = await MasterChefV2.deploy(process.env.MASTERCHEF, process.env.KSWAP, 1, process.env.BURN_WALLET_KEY as string);
  console.log('"masterChefV2":', `"${masterChefV2.address}",`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
