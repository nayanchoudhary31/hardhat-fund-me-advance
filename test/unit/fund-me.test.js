const { expect, assert } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("Fund Me Contract", async function () {
  //Before Each

  let fundMe;
  let deployer;
  let mockV3Aggregator;

  beforeEach(async () => {
    // deploy our fund me contract
    // using hardhat-deploy
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]); // Will deploy all the script tag with all
    fundMe = await ethers.getContract("FundMe", deployer); // Get the instance of latest fund me contract
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer); // Get the instance of latest mock v3 aggregator contract
  });

  describe("Constructor", async function () {
    it("Set the correct aggregator address!", async function () {
      const response = await fundMe.priceFeed(); //
      assert.equal(response, mockV3Aggregator.target);
    });
  });
});
