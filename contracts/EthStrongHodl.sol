// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract EthStrongHodl is ERC20Upgradeable, EIP712Upgradeable, OwnableUpgradeable{

    uint256 chainId;
    address public operator;
    bytes32 constant REDEEM_HASH = keccak256("Redeem(uint256 amount,uint256 sourceChainId,uint256 targetChainId,uint256 expiryTime,address targetAddress,bytes sourceAddress,bytes sourseHash)");

    mapping (bytes => bool) alreadyRedeemed;

    struct Redeem{
        uint256 amount;
        uint256 sourceChainId;
        uint256 targetChainId;
        uint256 expiryTime;
        address targetAddress;
        bytes sourceAddress;
        bytes sourseHash;
    }

    event changedOperator(address oldAddress, address newAddress);
    event redeemETHstUSDT(Redeem _redeem);
    event depositstUSDT(uint256 amount, uint256 sourceChainId, uint256 targetChainId, address sourceAddress);

    error WrongSourceChainId();
    error WrongTargetChainId();
    error WrongSignature();
    error TimeExpired(uint256 expectedTime);
    error InsufficientAmount();

    // constructor(){
    //     _disableInitializers();
    // }

    function initialize(address _operator) initializer external{
        chainId = 2;
        operator = _operator;
        __ERC20_init("shBTC", "shBTC");
        __EIP712_init("EthStrongHodl", "1");
        __Ownable_init(msg.sender);
    }

    function setOperator(address _operator) external onlyOwner(){
        operator = _operator;
        emit changedOperator(operator, _operator);
    }

    function redeem_stUSDT(Redeem calldata _redeem, bytes calldata _signature) external
    {
        if(_redeem.expiryTime < block.timestamp) revert TimeExpired(_redeem.expiryTime);
        if(_redeem.sourceChainId != chainId) revert WrongSourceChainId();
        if(_redeem.targetChainId == chainId) revert WrongTargetChainId();
        bytes32 hash = keccak256(abi.encode(REDEEM_HASH, _redeem.amount, _redeem.sourceChainId, _redeem.targetChainId, _redeem.expiryTime, _redeem.targetAddress, _redeem.sourceAddress, _redeem.sourseHash));
        bytes32 digest = _hashTypedDataV4(hash);
        console.logBytes32(digest);
        address signer = ECDSA.recover(digest, _signature);
        console.log("signer in contract smart contract==>: ", signer);

        if(signer != operator)
            revert WrongSignature();

        _mint(_redeem.targetAddress, _redeem.amount);
        alreadyRedeemed[_redeem.sourseHash] = true;
        emit redeemETHstUSDT(_redeem);
    }
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }


    function deposit(uint256 _amount, uint256 _destinationChainId) external
    {
        if(_amount == 0) revert InsufficientAmount();

        if(_destinationChainId == chainId)
            revert WrongTargetChainId();

        _burn(msg.sender, _amount);
        emit depositstUSDT(_amount, 2, _destinationChainId, msg.sender);
    }    
}