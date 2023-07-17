const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../hardhat-helper-config");
const { verify } = require("../utils/verify");

// Hardhat automatically give hre when we run using hardhat-deploy
module.exports = async (hre) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUSDPriceFeed;
  // const ethUSDPriceFeed = networkConfig[chainId]["ethUSDPriceFeed"];

  // When we use localhost or hardhat we need to use mocks
  if (chainId === 31337) {
    // Get the Mock Aggregator Address
    const ethUSDMockAggregator = await deployments.get("MockV3Aggregator");
    ethUSDPriceFeed = ethUSDMockAggregator.address;
  } else {
    ethUSDPriceFeed = networkConfig[chainId]["ethUSDPriceFeed"];
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUSDPriceFeed],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("----------------------------------------------------------------");

  if (chainId !== 31337) {
    await verify(fundMe.address, [ethUSDPriceFeed]);
  }
};

module.exports.tags = ["all", "fundme"];
