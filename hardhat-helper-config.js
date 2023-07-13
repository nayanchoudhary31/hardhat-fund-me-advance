const networkConfig = {
  31337: {
    name: "localhost",
  },
  5: {
    name: "goreli",
    ethUSDPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  11155111: {
    name: "sepolia",
    ethUSDPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  80001: {
    name: "mumbai",
    ethUSDPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
  },
};

const developmentChains = ["hardhat", "localhost"];

const DECIMAL = 8;
const INITIAL_AWNSER = 200000000000;

module.exports = {
  networkConfig,
  DECIMAL,
  INITIAL_AWNSER,
  developmentChains,
};
