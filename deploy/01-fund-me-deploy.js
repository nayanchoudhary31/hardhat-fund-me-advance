const { network } = require("hardhat");
const { networkConfig } = require("../hardhat-helper-config");

// Hardhat automatically give hre when we run using hardhat-deploy
module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts;
  const chainId = network.config.chainId;

  const ethUSDPriceFeed = networkConfig[chainId]["ethUSDPriceFeed"];

  // When we use localhost or hardhat we need to use mocks
};
