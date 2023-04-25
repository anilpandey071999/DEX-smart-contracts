import { KSwapToken, MasterChefV2, KswapPool__factory, KswapPool, MockBEP20, MockBEP20__factory } from "../typechain-types"
import { ethers } from "hardhat";
// import contracts from "./contractAddress.json"
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

  const masterChefV2: MasterChefV2 = await ethers.getContractAt("MasterChefV2", process.env.TESTNET_MASTERCHEFV2 as string, dev) as MasterChefV2;

  const dKSWAPPOOL: MockBEP20 = await ethers.getContractAt("MockBEP20", process.env.TESTNET_DUMMY_KSWAP_POOL, dev) as MockBEP20

  console.log(process.env.TESTNET_KSWAP as string, masterChefV2.address, process.env.TESTNET_ADMIN_WALLET_KEY as string, process.env.TESTNET_TREASURY_WALLET_KEY as string, process.env.TESTNET_OPERATOR_WALLET_KEY as string, 0,);
  
  const KswapPool: KswapPool__factory = await ethers.getContractFactory("KswapPool") as KswapPool__factory
  const kswapPool: KswapPool = await KswapPool.deploy(process.env.TESTNET_KSWAP as string, masterChefV2.address, process.env.TESTNET_ADMIN_WALLET_KEY as string, process.env.TESTNET_TREASURY_WALLET_KEY as string, process.env.TESTNET_OPERATOR_WALLET_KEY as string, 0, { gasLimit: 5000000 })
  console.log(`"KSwap Pool Address": `, `"${kswapPool.address}",`);

  console.log("In order get Kswap as rewards we again make one more dummy token");


  const updateWhiteList = await masterChefV2.updateWhiteList(kswapPool.address, true)
  const tx1 = await updateWhiteList.wait()
  console.log("UpdateWhiteList Done?", tx1.status==1);
  const approveTx = await dKSWAPPOOL.approve(kswapPool.address, ethers.constants.MaxUint256)
  const tx2 = await approveTx.wait()
  console.log("Is Approved?",  tx2.status==1);
  const inittx =  await kswapPool.init(dKSWAPPOOL.address)
  const tx = await inittx.wait()
  console.log("Init KSwapPool Done? ", tx.status ==1)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});