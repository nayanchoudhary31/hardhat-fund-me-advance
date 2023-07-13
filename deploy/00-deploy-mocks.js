const { network } = require("hardhat");
const {
  DECIMAL,
  INITIAL_AWNSER,
  developmentChains,
} = require("../hardhat-helper-config");

module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId === 31337) {
    log("Local network detected: Deploying Mocks Now");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMAL, INITIAL_AWNSER],
    });
    log("Mocks Deployed!");
    log("================================");
  }
};

module.exports.tags = ["all", "mocks"];
