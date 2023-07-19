// SPDX-License-Identifier: MIT
// Pragma
pragma solidity 0.8.7;

// User should be able to deposit minimum funds in term of USD to the contract
// Only i_owner should be able to withdraw funds

//Imports
import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

//Error Codes
error FundMe__NotOwner();

//Contracts

/**@title A sample Funding Contract
 * @author Nayan Chaudhary
 * @notice This contract is for creating a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;
    // Minimum USD to Deposit
    uint256 public constant MINIMUM_USD = 50 * 1e18; // 50_000000000000000000
    address[] private s_funders;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;
    mapping(address => uint256) private s_addressToFundMap;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address _priceFeed) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(_priceFeed);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getCoversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't send enough funds"
        );
        s_addressToFundMap[msg.sender] = msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        // Reset the s_funders Array and Map
        for (uint256 j = 0; j < s_funders.length; j++) {
            address funder = s_funders[j];
            s_addressToFundMap[funder] = 0;
        }
        // Reset the array
        s_funders = new address[](0);
        //Transfer the funds
        (bool ok, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(ok, "Tx Failed");
    }

    function withdrawCheap() public onlyOwner {
        address[] memory funders = s_funders;
        // Mapping can be stored in memory cause they are more complicated

        for (uint j = 0; j < funders.length; j++) {
            address funder = funders[j];
            s_addressToFundMap[funder] = 0;
        }

        s_funders = new address[](0);

        (bool ok, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(ok, "Tx Failed");
    }

    // View / Pure
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToFund(address funder) public view returns (uint256) {
        return s_addressToFundMap[funder];
    }
}
