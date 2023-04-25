import { expect, assert } from "chai";
import { ethers} from "hardhat";
import { KSwapToken, KSwapToken__factory, MasterChef, MasterChef__factory, MasterChefV2__factory, MasterChefV2, KswapPool__factory, KswapPool, MockBEP20__factory, MockBEP20, SyrupBar, SyrupBar__factory } from "../typechain-types"

describe("KswapPool", function () {
    async function deployKwapPool() {
        const [dev, bob, alice, burn, admin, treasury, operator, premint] = await ethers.getSigners();

        const KyotoSwap: KSwapToken__factory = await ethers.getContractFactory("KSwapToken") as KSwapToken__factory
        const kswap: KSwapToken = await KyotoSwap.deploy(premint.address)

        const Syrup: SyrupBar__factory = await ethers.getContractFactory("SyrupBar") as SyrupBar__factory
        const syrup: SyrupBar = await Syrup.deploy(kswap.address)

        const MasterChef: MasterChef__factory = await ethers.getContractFactory("MasterChef") as MasterChef__factory
        const masterChef: MasterChef = await MasterChef.deploy(
            kswap.address,
            syrup.address,
            dev.address,
            ethers.utils.parseEther('40'),
            "0"
        )

        await kswap.transferOwnership(masterChef.address)
        await syrup.transferOwnership(masterChef.address)


        const MockBEP20: MockBEP20__factory = await ethers.getContractFactory("MockBEP20") as MockBEP20__factory
        const mockBEP20: MockBEP20 = await MockBEP20.deploy("DummyToken", "DT")

        await masterChef.add("200", mockBEP20.address, true);


        const MasterChefV2: MasterChefV2__factory = await ethers.getContractFactory("MasterChefV2") as MasterChefV2__factory
        const masterChefV2: MasterChefV2 = await MasterChefV2.deploy(
            masterChef.address,
            kswap.address,
            1,
            burn.address,
        )

        await mockBEP20.approve(masterChefV2.address, ethers.constants.MaxUint256)
        await masterChefV2.init(mockBEP20.address)


        const DummyKswapPOOL: MockBEP20__factory = await ethers.getContractFactory("MockBEP20") as MockBEP20__factory
        const dKSWAPPOOL: MockBEP20 = await DummyKswapPOOL.deploy("DummyKswapPOOL", "dKSWAPPOOL")

        await masterChefV2.add("646639", dKSWAPPOOL.address, false, false)

    /**
     * @notice Constructor
     * @param _token: Kswap token contract
     * @param _masterchefV2: MasterChefV2 contract
     * @param _admin: address of the admin
     * @param _treasury: address of the treasury (collects fees)
     * @param _operator: address of operator
     * @param _pid: kswap pool ID in MasterChefV2
     */
        const KswapPool: KswapPool__factory = await ethers.getContractFactory("KswapPool") as KswapPool__factory
        const kswapPool: KswapPool = await KswapPool.deploy(kswap.address, masterChefV2.address, admin.address, treasury.address, operator.address, 0)

        const dKSWAPPOOLBalance = await dKSWAPPOOL.balanceOf(dev.address)
        // console.log(dKSWAPPOOLBalance);
        const poolInfo = await masterChefV2.lpToken(0)
        // console.log(poolInfo, dKSWAPPOOL.address);
        
        await masterChefV2.updateWhiteList(kswapPool.address,true)
        await dKSWAPPOOL.approve(kswapPool.address, dKSWAPPOOLBalance.toString())
        await kswapPool.init(dKSWAPPOOL.address)

        const LP: MockBEP20__factory = await ethers.getContractFactory("MockBEP20") as MockBEP20__factory
        const lp1: MockBEP20 = await LP.deploy('LPToken', "LP1")
        
        const lp2: MockBEP20 = await LP.deploy('LPToken', "LP2")
        
        const lp3: MockBEP20 = await LP.deploy('LPToken', "LP3")
        
        const lp4: MockBEP20 = await LP.deploy('LPToken', "LP4")

        await lp1.transfer(bob.address, "2000");
        await lp2.transfer(bob.address, "2000");
        await lp3.transfer(bob.address, "2000");
        await lp4.transfer(bob.address, "2000");

        await lp1.transfer(alice.address, "2000");
        await lp2.transfer(alice.address, "2000");
        await lp3.transfer(alice.address, "2000");
        await lp4.transfer(alice.address, "2000");

        return {
            kswap,
            syrup,
            masterChef,
            masterChefV2,
            kswapPool,
            mockBEP20,
            dKSWAPPOOL,
            lp1,
            lp2,
            lp3,
            lp4,
            dev, bob, alice, admin, treasury, operator
        }
    }

    it("staking/unstaking", async function () {
        const {kswap, masterChefV2, kswapPool, lp1, lp2, lp3, alice} = await deployKwapPool();
        await masterChefV2.add("1000", lp1.address, true, false);
        await masterChefV2.add("1000", lp2.address, true, false);
        await masterChefV2.add("1000", lp3.address, true, false);

        await lp1.connect(alice).approve(masterChefV2.address, "10");
        await masterChefV2.connect(alice).deposit(1, "2"); //0
        await masterChefV2.connect(alice).withdraw(1, "2"); //1

        await kswap.connect(alice).approve(kswapPool.address, "10000000000000000000000",);
        await kswapPool.connect(alice).deposit("10000000000001",0); //3
        assert.equal((await kswap.balanceOf(alice.address)).toString(), "47977485199999999");
        await kswapPool.connect(alice).deposit("10000000000001",0); //4
        assert.equal((await kswap.balanceOf(alice.address)).toString(), "47967485199999998");
        await kswapPool.connect(alice).withdrawAll();
        assert.equal((await kswap.balanceOf(alice.address)).toString(), "23027762465178244000");
    })

    it("Time Lock Less then Minimum lock period Check", async function () {
        const {kswap, masterChefV2, kswapPool, lp1, lp2, lp3,alice} = await deployKwapPool();
        await masterChefV2.add("1000", lp1.address, true, false);
        await masterChefV2.add("1000", lp2.address, true, false);
        await masterChefV2.add("1000", lp3.address, true, false);

        await lp1.connect(alice).approve(masterChefV2.address, "10");
        await masterChefV2.connect(alice).deposit(1, "2"); //0
        await masterChefV2.connect(alice).withdraw(1, "2"); //1

        await kswap.connect(alice).approve(kswapPool.address, "10000000000000000000000",);
        await expect( kswapPool.connect(alice).deposit("10000000000001",100)).to.be.revertedWith("Minimum lock period is one week"); //3
    })

    it("Time Lock more then Max lock period", async function () {
        const {kswap, masterChefV2, kswapPool, lp1, lp2, lp3,alice} = await deployKwapPool();
        await masterChefV2.add("1000", lp1.address, true, false);
        await masterChefV2.add("1000", lp2.address, true, false);
        await masterChefV2.add("1000", lp3.address, true, false);

        await lp1.connect(alice).approve(masterChefV2.address, "10");
        await masterChefV2.connect(alice).deposit(1, "2"); //0
        await masterChefV2.connect(alice).withdraw(1, "2"); //1

        await kswap.connect(alice).approve(kswapPool.address, "10000000000000000000000",);
        await expect( kswapPool.connect(alice).deposit("10000000000001",86400001)).to.be.revertedWith("Maximum lock period exceeded"); //3
    })

    it("Less then Minimum Deposit check",async function () {
        const {kswap, masterChefV2, kswapPool, lp1, lp2, lp3,alice} = await deployKwapPool();

        await masterChefV2.add("1000", lp1.address, true, false);
        await masterChefV2.add("1000", lp2.address, true, false);
        await masterChefV2.add("1000", lp3.address, true, false);

        await lp1.connect(alice).approve(masterChefV2.address, "10");
        await masterChefV2.connect(alice).deposit(1, "2"); //0
        await masterChefV2.connect(alice).withdraw(1, "2"); //1

        await kswap.connect(alice).approve(kswapPool.address, "10000000000000000000000",);
        await expect( kswapPool.connect(alice).deposit("20",86400001)).to.be.revertedWith("Deposit amount must be greater than MIN_DEPOSIT_AMOUNT"); //3
    })
})