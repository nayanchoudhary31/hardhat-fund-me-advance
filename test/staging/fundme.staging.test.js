const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChains } = require("../../hardhat-helper-config");
const { assert } = require("chai");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Staging Testing", async function () {
      let fundme, deployer;
      beforeEach(async function () {
        //Deploy the fundme contract using hardhat-deplpoy
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]); // Will run the script tag with all
        fundme = await ethers.getContract("FundMe", deployer); // Get the instance of latest fund me contract
      });

      it("allow user to fund and withdraw", async function () {
        const sendValue = ethers.utils.parseEther("1");
        await fundme.fund({ value: sendValue });
        await fundme.withdrawCheap();
        const endingBalanceFundMe = await ethers.provider.getBalance(
          fundme.address
        );
        assert.equal(endingBalanceFundMe.toString(), "0");
      });
    });
