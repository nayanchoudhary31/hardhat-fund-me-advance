const { expect, assert } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../hardhat-helper-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Fund Me Contract", async function () {
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
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        ); // Get the instance of latest mock v3 aggregator contract
      });

      describe("Constructor", async function () {
        it("Set the correct aggregator address!", async function () {
          const response = await fundMe.getPriceFeed(); //
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("Fund", async function () {
        it("fails if don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "Didn't send enough fund"
          );
        });

        it("amount should be updated in mapping", async function () {
          const sendVal = ethers.utils.parseEther("1");
          await fundMe.fund({ value: sendVal });
          const response = await fundMe.getAddressToFund(deployer);
          assert.equal(response.toString(), sendVal.toString());
        });

        it("should add the getFunder to funder list", async function () {
          const sendVal = ethers.utils.parseEther("1");
          await fundMe.fund({ value: sendVal });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("Withdraw", async () => {
        beforeEach(async function () {
          const value = ethers.utils.parseEther("1");
          await fundMe.fund({ value: value });
        });

        it("should withdraw ETH from a single funder", async function () {
          //Arrange Test
          const startingFundMe = await fundMe.provider.getBalance(
            fundMe.address
          );
          const deployerStartBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act on Test
          const transactionResponse = await fundMe.withdraw();
          const txReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMe.add(deployerStartBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("should cheap withdraw ETH from a single funder", async function () {
          //Arrange Test
          const startingFundMe = await fundMe.provider.getBalance(
            fundMe.address
          );
          const deployerStartBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act on Test
          const transactionResponse = await fundMe.withdrawCheap();
          const txReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMe.add(deployerStartBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("should be able to withdraw ETH from multiple getFunder", async function () {
          const accounts = await ethers.getSigners();
          const sendVal = ethers.utils.parseEther("1");
          for (let j = 1; j < 6; j++) {
            const fundMeConnect = await fundMe.connect(accounts[j]);
            await fundMeConnect.fund({ value: sendVal });
          }

          const startingFundMe = await fundMe.provider.getBalance(
            fundMe.address
          );
          const deployerStartBalance = await fundMe.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const txReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMe.add(deployerStartBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          // Make Sure the funder arrays are reset
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(await fundMe.getAddressToFund(accounts[i].address), 0);
          }
        });

        it("should be able to withdraw cheap ETH from multiple getFunder", async function () {
          const accounts = await ethers.getSigners();
          const sendVal = ethers.utils.parseEther("1");
          for (let j = 1; j < 6; j++) {
            const fundMeConnect = await fundMe.connect(accounts[j]);
            await fundMeConnect.fund({ value: sendVal });
          }

          const startingFundMe = await fundMe.provider.getBalance(
            fundMe.address
          );
          const deployerStartBalance = await fundMe.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdrawCheap();
          const txReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMe.add(deployerStartBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          // Make Sure the funder arrays are reset
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(await fundMe.getAddressToFund(accounts[i].address), 0);
          }
        });

        it("should be reverted if caller is not owner", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const fundMeConnectContract = await fundMe.connect(attacker);

          await expect(fundMeConnectContract.withdraw()).to.be.revertedWith(
            "FundMe__NotOwner"
          );
        });
      });
    });
