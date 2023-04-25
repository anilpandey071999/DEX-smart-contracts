import { KSwapToken, KSwapToken__factory, MasterChef, MasterChef__factory, SyrupBar, SyrupBar__factory } from "../typechain-types"
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
    console.log("Starting Deployment");
    const [dev] = await ethers.getSigners();

    const KyotoSwap: KSwapToken__factory = await ethers.getContractFactory("KSwapToken") as KSwapToken__factory
    const kswap: KSwapToken = await KyotoSwap.deploy(process.env.PRE_MINT_KSWAP_ADDRESS as string);
    console.log("\"kswap\": ", `"${kswap.address}",`)

    const Syrup: SyrupBar__factory = await ethers.getContractFactory("SyrupBar") as SyrupBar__factory
    const syrup: SyrupBar = await Syrup.deploy(process.env.KSWAP)
    console.log("\"syrup\": ", `"${syrup.address}",`)

    console.log( process.env.KSWAP,
        process.env.SYRUP,
        dev.address,
        ethers.utils.parseEther('40'),
        "23535072");
    
    const MasterChef: MasterChef__factory = await ethers.getContractFactory("MasterChef") as MasterChef__factory
    const masterChef: MasterChef = await MasterChef.deploy(
        process.env.KSWAP,
        process.env.SYRUP,
        dev.address,
        ethers.utils.parseEther('40'),
        "23535072"
    )
    console.log("\"masterChef\": ", `"${masterChef.address}",`)

    console.log("---------------Transfering OwnerShip to MASTERCHEFV1----------------------");

    await kswap.transferOwnership(masterChef.address)
    await syrup.transferOwnership(masterChef.address)

    console.log("----------Transfering OwnerShip to MASTERCHEFV1 complited----------------------");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
