import { expect, assert } from "chai";
import { ethers, network } from "hardhat";
import { KSwapToken, KSwapToken__factory, MasterChef, MasterChef__factory, MockBEP20, MockBEP20__factory, SyrupBar, SyrupBar__factory } from "../typechain-types"

describe("MasterChef", function () {

    async function deployDexToken() {
        const [devaddress, bob, alice, premint] = await ethers.getSigners();

        const latestBlock = await ethers.provider.getBlock("latest")

        const KyotoSwap: KSwapToken__factory = await ethers.getContractFactory("KSwapToken") as KSwapToken__factory
        const kswap: KSwapToken = await KyotoSwap.deploy(premint.address)

        const Syrup: SyrupBar__factory = await ethers.getContractFactory("SyrupBar") as SyrupBar__factory
        const syrup: SyrupBar = await Syrup.deploy(kswap.address)

        const MasterChef: MasterChef__factory = await ethers.getContractFactory("MasterChef") as MasterChef__factory
        const masterChef: MasterChef = await MasterChef.deploy(
            kswap.address,
            syrup.address,
            devaddress.address,
            ethers.utils.parseEther('40'),
            "0"
        )

        await kswap.transferOwnership(masterChef.address)
        await syrup.transferOwnership(masterChef.address)

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

        return { kyoto: kswap, syrup, masterChef, lp1, lp2, lp3, lp4, devaddress, bob, alice, latestBlock }
    }

    it("real case", async function () {
        const { kyoto, syrup, masterChef, lp1, lp2, lp3, lp4, devaddress, bob, alice, latestBlock } = await deployDexToken();
        await masterChef.add("200", lp1.address, true);
        await masterChef.add("20", lp2.address, true);
        await masterChef.add("50", lp3.address, true);
        await masterChef.add("400", lp3.address, true);
        await masterChef.add("206", lp3.address, true);
        await masterChef.add("246", lp3.address, true);
        await masterChef.add("216", lp3.address, true);
        await masterChef.add("244", lp3.address, true);
        await masterChef.add("216", lp3.address, true);
        let poolLength = parseInt((await masterChef.poolLength()).toString());

        assert.equal(poolLength, 10)
        await network.provider.send("hardhat_mine", ["0x100"]);

        await lp1.connect(alice).approve(masterChef.address, "1000");
        assert.equal((await kyoto.balanceOf(alice.address)).toString(), "0");
        await masterChef.connect(alice).deposit(1, "20")

        await masterChef.connect(alice).withdraw(1, "20")
        let alicebalance = await (await kyoto.balanceOf(alice.address)).toString()
        const totalSupply = await (await kyoto.totalSupply()).toString()
        expect(parseInt(alicebalance)).to.lessThan(parseInt(totalSupply))

        await kyoto.connect(alice).approve(masterChef.address, alicebalance)
        alicebalance = await (await kyoto.balanceOf(alice.address)).toString()
        await masterChef.connect(alice).enterStaking(ethers.utils.parseEther("1"))
        alicebalance = await (await kyoto.balanceOf(alice.address)).toString()

        expect(parseInt(ethers.utils.formatEther(alicebalance))).to.greaterThan(1.5);
    })

    it("deposit/withdraw", async () => {
        const { kyoto, syrup, masterChef, lp1, lp2, lp3, lp4, devaddress, bob, alice, latestBlock } = await deployDexToken();
        await masterChef.add("1000", lp1.address, true)
        await masterChef.add("1000", lp2.address, true)
        await masterChef.add("1000", lp3.address, true)

        await lp1.connect(alice).approve(masterChef.address, "100")
        await masterChef.connect(alice).deposit(1, "20")
        await masterChef.connect(alice).deposit(1, "0")
        await masterChef.connect(alice).deposit(1, "40")
        await masterChef.connect(alice).deposit(1, "0")

        assert.equal((await lp1.balanceOf(alice.address)).toString(), "1940");

        await masterChef.connect(alice).withdraw(1, "10");
        assert.equal((await lp1.balanceOf(alice.address)).toString(), "1950");
        assert.equal((await kyoto.balanceOf(alice.address)).toString(), "39999999999999999999");
        assert.equal((await kyoto.balanceOf(devaddress.address)).toString(), "4000000000000000000");

        await lp1.connect(bob).approve(masterChef.address, "100");
        assert.equal((await lp1.balanceOf(bob.address)).toString(), "2000");
        await masterChef.connect(bob).deposit(1, "50");
        assert.equal((await lp1.balanceOf(bob.address)).toString(), "1950");
        await masterChef.connect(bob).deposit(1, "0");
        assert.equal((await kyoto.balanceOf(bob.address)).toString(), "5000000000000000000");
        await masterChef.connect(bob).emergencyWithdraw(1);
        assert.equal((await lp1.balanceOf(bob.address)).toString(), "2000");
    })

    it("staking/unstaking", async function () {
        const { kyoto, syrup, masterChef, lp1, lp2, lp3, lp4, devaddress, bob, alice, latestBlock } = await deployDexToken();
        await masterChef.add("1000", lp1.address, true);
        await masterChef.add("1000", lp2.address, true);
        await masterChef.add("1000", lp3.address, true);

        await lp1.connect(alice).approve(masterChef.address, "10");
        await masterChef.connect(alice).deposit(1, "2"); //0
        await masterChef.connect(alice).withdraw(1, "2"); //1

        await kyoto.connect(alice).approve(masterChef.address, "250",);
        await masterChef.connect(alice).enterStaking("240",); //3
        assert.equal((await syrup.balanceOf(alice.address)).toString(), "240");
        assert.equal((await kyoto.balanceOf(alice.address)).toString(), "9999999999999999760");
        await masterChef.connect(alice).enterStaking("10",); //4
        assert.equal((await syrup.balanceOf(alice.address)).toString(), "250");
        assert.equal((await kyoto.balanceOf(alice.address)).toString(), "19999999999999999749");
        await masterChef.connect(alice).leaveStaking(250);
        assert.equal((await syrup.balanceOf(alice.address)).toString(), "0");
        assert.equal((await kyoto.balanceOf(alice.address)).toString(), "29999999999999999999");
    })

    it("updaate multiplier", async () => {
        const { kyoto, syrup, masterChef, lp1, lp2, lp3, lp4, devaddress, bob, alice, latestBlock } = await deployDexToken();

        await masterChef.add("1000", lp1.address, true);
        await masterChef.add("1000", lp2.address, true);
        await masterChef.add("1000", lp3.address, true);

        await lp1.connect(alice).approve(masterChef.address, "100");
        await lp1.connect(bob).approve(masterChef.address, "100");
        await masterChef.connect(alice).deposit(1, "100");
        await masterChef.connect(bob).deposit(1, "100");
        await masterChef.connect(alice).deposit(1, "0");
        await masterChef.connect(bob).deposit(1, "0");

        await kyoto.connect(alice).approve(masterChef.address, "100");
        await kyoto.connect(bob).approve(masterChef.address, "100");
        await masterChef.connect(alice).enterStaking("50");
        await masterChef.connect(bob).enterStaking("100");

        await masterChef.updateMultiplier("0");

        await masterChef.connect(alice).enterStaking("0");
        await masterChef.connect(bob).enterStaking("0");
        await masterChef.connect(alice).deposit(1, "0");
        await masterChef.connect(bob).deposit(1, "0");

        assert.equal((await kyoto.balanceOf(alice.address)).toString(), "29999999999999999950");
        assert.equal((await kyoto.balanceOf(bob.address)).toString(), "9999999999999999900");

        await network.provider.send("hardhat_mine", ["0x100"]);

        await masterChef.connect(alice).enterStaking("0");
        await masterChef.connect(bob).enterStaking("0");
        await masterChef.connect(alice).deposit(1, "0");
        await masterChef.connect(bob).deposit(1, "0");

        assert.equal((await kyoto.balanceOf(alice.address)).toString(), "29999999999999999950");
        assert.equal((await kyoto.balanceOf(bob.address)).toString(), "9999999999999999900");

        await masterChef.connect(alice).leaveStaking("50");
        await masterChef.connect(bob).leaveStaking("100");
        await masterChef.connect(alice).withdraw(1, "100");
        await masterChef.connect(bob).withdraw(1, "100");
    });

    it("should allow dev and only dev to update dev", async () => {
        const { kyoto, syrup, masterChef, lp1, lp2, lp3, lp4, devaddress, bob, alice, latestBlock } = await deployDexToken();

        assert.equal((await masterChef.devaddr()).valueOf(), devaddress.address);
        await expect(masterChef.connect(bob).dev(bob.address)).to.be.revertedWith("dev: wut?");
        await masterChef.dev(bob.address);
        assert.equal((await masterChef.devaddr()).valueOf(), bob.address);
        await masterChef.connect(bob).dev(alice.address);
        assert.equal((await masterChef.devaddr()).valueOf(), alice.address);
    });
})