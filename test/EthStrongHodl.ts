import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { beforeEach } from "mocha";
import { EthStrongHodl, EthStrongHodl__factory } from "../typechain-types";

describe("Eth Strong Hodl Test cases", async () => {
    let admin: Signer;
    let user: Signer;
    let user1: Signer;
    let user2: Signer;
    let contract: EthStrongHodl;
	let chainID: number = 2;
    
    beforeEach(async () => {
      [admin, user, user1, user2] = await ethers.getSigners();
      contract = await new EthStrongHodl__factory(admin).deploy(); 
      await contract.initialize(await admin.getAddress()); 	
    });

	describe("Redeem and Deposit Flow", function () {
        let message: any;
        let signature: string;
        let amountToRedeem = ethers.parseEther("1000");

        beforeEach(async function () {
            const targetAddress = ethers.toBigInt(await user.getAddress()) & BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"); // uint160 conversion
            const sourceAddress = ethers.keccak256(await user.getAddress());
            const sourceHash = ethers.keccak256(ethers.toUtf8Bytes(sourceAddress));

            const domain = {
                name: "EthStrongHodl",
                version: "1",
                verifyingContract: (await contract.getAddress()).toString(),
                chainId: 31337, // Hardhat Chain
            };

            const types = {
                Redeem: [
                    { name: "amount", type: "uint256" },
                    { name: "sourceChainId", type: "uint256" },
                    { name: "targetChainId", type: "uint256" },
                    { name: "expiryTime", type: "uint256" },
                    { name: "targetAddress", type: "uint160" },
                    { name: "sourceAddress", type: "bytes32" },
                    { name: "sourseHash", type: "bytes32" },
                ],
            };

            message = {
                amount: amountToRedeem,
                sourceChainId: 2,
                targetChainId: 1,
                expiryTime: Math.floor(Date.now() / 1000) + 1000,
                targetAddress: targetAddress,
                sourceAddress: sourceAddress,
                sourseHash: sourceHash,
            };

            signature = await admin.signTypedData(domain, types, message);
        });

        it("should successfully redeem tokens and update balance", async function () {
            await expect(contract.connect(user).redeem_shBTC(message, signature))
                .to.emit(contract, "redeemETHshBTC");

            const userBalance = await contract.balanceOf(await user.getAddress());
            expect(userBalance).to.equal(amountToRedeem);
        });

        it("should prevent double redemption using the same sourceHash", async function () {
            await contract.connect(user).redeem_shBTC(message, signature);

            await expect(contract.connect(user).redeem_shBTC(message, signature))
                .to.be.revertedWithCustomError(contract, "AlreadyClaimed");
        });

        it("should allow the user to deposit redeemed tokens", async function () {
            await contract.connect(user).redeem_shBTC(message, signature);

            await contract.connect(user).approve(contract.getAddress(), amountToRedeem);
            await expect(contract.connect(user).deposit(amountToRedeem, 3))
                .to.emit(contract, "depositshBTC")
                .withArgs(amountToRedeem, 2, 3, await user.getAddress());

            const userBalance = await contract.balanceOf(await user.getAddress());
            expect(userBalance).to.equal(0);
        });

        it("should revert deposit if amount is zero", async function () {
            await expect(contract.connect(user).deposit(0, 3))
                .to.be.revertedWithCustomError(contract, "InsufficientAmount");
        });

        it("should revert deposit if destination chain ID matches current chain", async function () {
            await expect(contract.connect(user).deposit(amountToRedeem, 2))
                .to.be.revertedWithCustomError(contract, "WrongTargetChainId");
        });
    });

});
