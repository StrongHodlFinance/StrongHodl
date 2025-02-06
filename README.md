# ETH-SmartContract (StrongHodl)

## Overview
ETH-SmartContract (StrongHodl) is a blockchain project built using Hardhat. It implements a custom ERC-20 token along with an ERC-721 based MNT token. This project enables token minting, transfers, and smart contract interactions on the Ethereum blockchain.

## Features
- **Custom ERC-20 Token**: Implements an ERC-20 token with minting and transfer functionalities.
- **ERC-721 MNT Token**: Integrates an ERC-721-based token mechanism.
- **Hardhat Development Environment**: Uses Hardhat for smart contract compilation, testing, and deployment.
- **Secure and Efficient**: Built with best practices for security and gas optimization.

## Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Hardhat](https://hardhat.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation
Clone the repository and install dependencies:
```sh
git clone https://github.com/StrongHodlFinance/StrongHodl.git
cd StrongHodl
npm install
```

## Usage
### Compile Smart Contracts
```sh
npx hardhat compile
```

### Run Tests
```sh
npx hardhat test
```

## Folder Structure
```
ETH-SmartContract-StrongHodl/
├── contracts/       # Smart contracts (ERC-20, ERC-721, etc.)
├── scripts/         # Deployment and interaction scripts
├── test/            # Test cases for contracts
├── hardhat.config.js # Hardhat configuration file
├── package.json     # Project dependencies and scripts
└── README.md        # Project documentation
```



