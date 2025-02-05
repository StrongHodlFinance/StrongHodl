import { expect } from "chai";
import { ethers } from "hardhat";
import { AbiCoder, Signer } from "ethers";
import { beforeEach } from "mocha";
import { EthStrongHodl, EthStrongHodl__factory } from "../typechain-types";

describe("Eth Strong Hodl Test cases", async () => {
    let admin: Signer;
    let user: Signer;
    let user1: Signer;
    let user2: Signer;
    let salt: string;
    let contract: EthStrongHodl;
    const chainId = 2; 
    const expiryTime = Math.floor(Date.now() / 1000) + 3600;
    
    beforeEach(async () => {
      [admin, user, user1, user2] = await ethers.getSigners();
      contract = await new EthStrongHodl__factory(admin).deploy(); 
      await contract.initialize(await admin.getAddress());     
      console.log("user address: ", await user.getAddress());
      console.log("user1 address: ", await user1.getAddress());
    });

    // it('testing', async () => {
    //     const domain = {
    //         name: "EthStrongHodl",
    //         version: "1",   
    //         chainId: 2,
    //         verifyingContract: contract.target.toString()
    //         };
    //         console.log("chaiId: ", await ethers.provider.getNetwork().then((n) => n.chainId))
        
    //         const types = {
    //             redeem_stUSDT: [
    //             { name: "amount", type: "uint256" },
    //             { name: "sourceChainId", type: "uint256" },
    //             { name: "targetChainId", type: "uint256" },
    //             { name: "expiryTime", type: "uint256"},
    //             { name: "targetAddress", type: "address"},
    //             { name: "sourceAddress", type: "bytes" },
    //             { name: "sourseHash", type: "bytes" }
    //         ],
    //         };
        
    //         const message = {
    //             amount: ethers.parseEther("10"),
    //             sourceChainId: 2,  
    //             targetChainId: 1,
    //             expiryTime: Math.floor(Date.now() / 1000) + 3600,
    //             targetAddress: await user1.getAddress(),
    //             sourceAddress: await user2.getAddress(),
    //             sourceHash: ethers.keccak256(ethers.toUtf8Bytes(await user2.getAddress()))
    //         };
        
    //         const sign = await admin.signTypedData(domain, types, message);

    //         await contract.connect(user).redeem_stUSDT(redeemDummyData, sign);

    //         const balanceAfterRedeem = await contract.balanceOf(redeemDummyData.targetAddress);
    //         expect(balanceAfterRedeem).to.equal(redeemDummyData.amount);
        
    //         // Step 3: Now user should be able to deposit
    //         const depositAmount = ethers.parseEther("5");
    //         const destinationChainId = 2;  // SOL
        
    //         // Perform the deposit
    //         await contract.connect(user).deposit(depositAmount, destinationChainId);
        
    //         // Verify the user's balance after deposit (should have burned 5 tokens)
    //         const balanceAfterDeposit = await contract.balanceOf(redeemDummyData.targetAddress);
    //         expect(balanceAfterDeposit).to.equal(redeemDummyData.amount - depositAmount);
        
    //         // Ensure the total supply has decreased by the deposited amount
    //         const totalSupplyAfterDeposit = await contract.totalSupply();
    //         expect(totalSupplyAfterDeposit).to.equal(balanceAfterRedeem - depositAmount);
    //     });
    // function generateVaultAddress(seed: string) {
    //       const hashedSeed = ethers.keccak256(ethers.toUtf8Bytes(seed));
    //       const rawAddress = "0x" + hashedSeed.slice(-40);
        
    //       return `${ethers.getAddress(rawAddress)}`;
    // }
      describe("Redeem Functionality", function () {
        it.only("should mint tokens for a valid redeem request", async function () {

          // const sourceAddress = ethers.zeroPadBytes(ethers.getBytes(await user1.getAddress()), 32);
          const abiCoder = new AbiCoder();
          const sourceAddress = (abiCoder.encode(["address"], [await user1.getAddress()]));
          const sourceHash = ethers.keccak256(sourceAddress);
          console.log("this.contract.getAddress()222==>",contract.target)

          const domain = {
            name: "EthStrongHodl",
            version: "1",
            verifyingContract: (contract.target).toString(),
            chainId: 31337,
          };
        
          const types = {
            Redeem: [
              { name: "amount", type: "uint256" },
              { name: "sourceChainId", type: "uint256" },
              { name: "targetChainId", type: "uint256" },
              { name: "expiryTime", type: "uint256" },
              { name: "targetAddress", type: "address" },
              { name: "sourceAddress", type: "bytes" },
              { name: "sourseHash", type: "bytes" },
            ],
          };
        
          const message = {
            amount: ethers.parseEther("1000"),
            sourceChainId: 2,
            targetChainId: 1,
            expiryTime: 99999999999,
            targetAddress: await user.getAddress(),
            sourceAddress: sourceAddress,
            sourseHash: sourceHash,
          };
        
          // console.log("Message: ", message);
          const signature = await admin.signTypedData(domain, types, message);
          console.log("Signature:====> ", signature);
          const d = await contract.getDomainSeparator();
          console.log("Domain Separator (Contract):", d);
          
          const domainSeparator = ethers.TypedDataEncoder.hashDomain(domain);
          console.log("Domain Separator (Test):", domainSeparator);
          expect(d).to.equal(domainSeparator);

          const recoveredSigner = ethers.verifyTypedData(domain, types, message, signature);
          console.log("Recovered Signer: ", recoveredSigner);
          console.log("Operator: ", await contract.operator());

          const messageForContract = {
            amount: ethers.parseEther("1000"),
            sourceChainId: 2,
            targetChainId: 1,
            expiryTime: 99999999999,
            targetAddress: await user.getAddress(),
            sourceAddress: sourceAddress,
            sourseHash: sourceHash,
        };
        console.log(messageForContract, "messageForContract");
        
          await expect(contract.connect(user).redeem_stUSDT(message, signature))
            .to.emit(contract, "redeemETHstUSDT");
        
          const balance = await contract.balanceOf(await user.getAddress());
          expect(balance).to.equal(ethers.parseEther("1000"));
        });
        
      });
});
