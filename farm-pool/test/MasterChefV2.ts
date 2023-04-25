import { expect, assert } from "chai";
import { ethers, network } from "hardhat";
import { KSwapToken, KSwapToken__factory, MasterChef, MasterChef__factory, MasterChefV2__factory, MasterChefV2, MockBEP20__factory, MockBEP20, SyrupBar, SyrupBar__factory } from "../typechain-types";

describe("MasterChefV2", function () {
  async function deployDeXTokenAndMasterChefs() {
    const [dev, bob, alice, burn, premint] = await ethers.getSigners();

    const KyotoSwap: KSwapToken__factory = await ethers.getContractFactory("KSwapToken") as KSwapToken__factory;
    const kswap: KSwapToken = await KyotoSwap.deploy(premint.address);

    const Syrup: SyrupBar__factory = await ethers.getContractFactory("SyrupBar") as SyrupBar__factory;
    const syrup: SyrupBar = await Syrup.deploy(kswap.address);

    const MasterChef: MasterChef__factory = await ethers.getContractFactory("MasterChef") as MasterChef__factory;
    const masterChef: MasterChef = await MasterChef.deploy(kswap.address, syrup.address, dev.address, ethers.utils.parseEther("40"), "0");

    await kswap.transferOwnership(masterChef.address);
    await syrup.transferOwnership(masterChef.address);

    const MockBEP20: MockBEP20__factory = await ethers.getContractFactory("MockBEP20") as MockBEP20__factory;
    const mockBEP20: MockBEP20 = await MockBEP20.deploy("DummyToken", "DT");

    await masterChef.add("200", mockBEP20.address, true);

    const MasterChefV2: MasterChefV2__factory = await ethers.getContractFactory("MasterChefV2") as MasterChefV2__factory;
    const masterChefV2: MasterChefV2 = await MasterChefV2.deploy(masterChef.address, kswap.address, 1, burn.address);

    await mockBEP20.approve(masterChefV2.address, ethers.constants.MaxUint256);
    await masterChefV2.init(mockBEP20.address);

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
      kyoto: kswap,
      syrup,
      masterChef,
      masterChefV2,
      mockBEP20,
      lp1,
      lp2,
      lp3,
      lp4,
      dev,
      bob,
      alice
    };
  }
  it("Real Case", async function () {
    const { kyoto, masterChefV2, lp1, lp2, lp3, alice} = await deployDeXTokenAndMasterChefs();
    await masterChefV2.add("200", lp1.address, true, false);
    await masterChefV2.add("20", lp2.address, true, false);
    await masterChefV2.add("50", lp3.address, true, false);
    await masterChefV2.add("400", lp3.address, true, false);
    await masterChefV2.add("206", lp3.address, true, false);
    await masterChefV2.add("246", lp3.address, true, false);
    await masterChefV2.add("216", lp3.address, true, false);
    await masterChefV2.add("244", lp3.address, true, false);
    await masterChefV2.add("216", lp3.address, true, false);
    let poolLength = parseInt((await masterChefV2.poolLength()).toString());

    assert.equal(poolLength, 9);
    await network.provider.send("hardhat_mine", ["0x100"]);
    await lp1.connect(alice).approve(masterChefV2.address, "1000");
    assert.equal((await kyoto.balanceOf(alice.address)).toString(), "0");
    await masterChefV2.connect(alice).deposit(0, "20");

    await masterChefV2.connect(alice).withdraw(0, "20");
    let alicebalance =  (await kyoto.balanceOf(alice.address)).toString();
    const totalSupply =  (await kyoto.totalSupply()).toString();
    expect(parseInt(alicebalance)).to.lessThan(parseInt(totalSupply));
  });

  it("deposit/withdraw", async () => {
    const { kyoto, masterChefV2, lp1, lp2, lp3, dev, bob, alice} = await deployDeXTokenAndMasterChefs();
    await masterChefV2.add("1000", lp1.address, true, false);
    await masterChefV2.add("1000", lp2.address, true, false);
    await masterChefV2.add("1000", lp3.address, true, false);

    await lp1.connect(alice).approve(masterChefV2.address, ethers.constants.MaxUint256);
    await masterChefV2.connect(alice).deposit(0, "20");
    await masterChefV2.connect(alice).deposit(0, "0");
    await masterChefV2.connect(alice).deposit(0, "40");
    await masterChefV2.connect(alice).deposit(0, "0");

    assert.equal((await lp1.balanceOf(alice.address)).toString(), "1940");

    await masterChefV2.connect(alice).withdraw(0, "10");
    assert.equal((await lp1.balanceOf(alice.address)).toString(), "1950");
    assert.equal((await kyoto.balanceOf(alice.address)).toString(), "191949940800000000");
    assert.equal((await kyoto.balanceOf(dev.address)).toString(), "54135338345864661654");

    await lp1.connect(bob).approve(masterChefV2.address, "100");
    assert.equal((await lp1.balanceOf(bob.address)).toString(), "2000");
    await masterChefV2.connect(bob).deposit(0, "50");
    assert.equal((await lp1.balanceOf(bob.address)).toString(), "1950");
    await masterChefV2.connect(bob).deposit(0, "0");
    assert.equal((await kyoto.balanceOf(bob.address)).toString(), "23993742600000000");
    await masterChefV2.connect(bob).emergencyWithdraw(0);
    assert.equal((await lp1.balanceOf(bob.address)).toString(), "2000");
  });
});
