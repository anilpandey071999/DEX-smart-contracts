import { MasterChefV2,MockBEP20__factory, MockBEP20 } from "../typechain-types"
import { ethers } from "hardhat";
// import process.env from "./contractAddress.json"

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

    const masterChefV2: MasterChefV2 = await ethers.getContractAt("MasterChefV2", process.env.MASTERCHEFV2, dev) as MasterChefV2
    const mockBEP20: MockBEP20 = await ethers.getContractAt("MockBEP20", process.env.MASTERCHEF_DUMMY_TOKEN, dev) as MockBEP20;

    console.log("---------Approving Masterchefv2 future oprations -------");
    const approveTX = await mockBEP20.approve(masterChefV2.address, ethers.constants.MaxUint256)
    await approveTX.wait()
    console.log("---By calling Init function of Masyterchef v2 deployment will be complited---");
    const initTX = await masterChefV2.init(mockBEP20.address)
    await initTX.wait();
    console.log("----------MasterchefV2 Initialization complited-----------");

    const DummyKswapPOOL: MockBEP20__factory = await ethers.getContractFactory("MockBEP20") as MockBEP20__factory
    const dKSWAPPOOL: MockBEP20 = await DummyKswapPOOL.deploy("DummyKswapPOOL", "dKSWAPPOOL")
    console.log(`"Dummy KSWAP POOL Address": `, `"${dKSWAPPOOL.address}",`);
  
    console.log("Adding Dummy KSWAPPOOL Farm to masterchefV2 ");
    
    await masterChefV2.add("646639", dKSWAPPOOL.address, false, false)

    console.log("Adding Dummy KSWAPPOOL Farm to masterchefV2 Completed ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});