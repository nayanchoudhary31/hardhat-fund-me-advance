// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData(); // Price 8 Decimal
        return uint256(price * 1e10); // price -> (8 decimal * 1e10) (3_00000000 * 1_0000000000)
    }

    function getCoversionRate(
        uint256 _ethAmount,
        AggregatorV3Interface _priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(_priceFeed); // 3000_000000000000000000
        uint256 ethPriceInUSD = (_ethAmount * ethPrice) / 1e18; // (1_000000000000000000 * 3000_000000000000000000) 1e36 / 1e18 -> 1e2
        return ethPriceInUSD;
    }
}
