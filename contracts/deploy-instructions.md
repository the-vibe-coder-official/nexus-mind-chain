# Smart Contract Deployment Instructions

## Prerequisites
- Node.js installed (v16 or higher)
- MetaMask or another Web3 wallet
- Some testnet ETH (for gas fees)

## Setup Hardhat

1. **Initialize a new directory for Hardhat** (outside of this Lovable project):
```bash
mkdir neuralink-contracts
cd neuralink-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

2. **Copy the contract**:
   - Copy `NeuraLinkAgent.sol` to `contracts/` folder in your Hardhat project

3. **Configure Hardhat** (`hardhat.config.js`):
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Add other networks as needed
  },
};
```

4. **Create `.env` file**:
```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_wallet_private_key
```

## Deploy the Contract

1. **Create deployment script** (`scripts/deploy.js`):
```javascript
const hre = require("hardhat");

async function main() {
  const NeuraLinkAgent = await hre.ethers.getContractFactory("NeuraLinkAgent");
  const agent = await NeuraLinkAgent.deploy();
  await agent.waitForDeployment();
  
  const address = await agent.getAddress();
  console.log("NeuraLinkAgent deployed to:", address);
  
  // Save the address - you'll need it for the frontend
  console.log("\nUpdate your frontend with this contract address!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

2. **Deploy to testnet**:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. **Verify on Etherscan** (optional):
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## Get Testnet ETH

- **Sepolia**: https://sepoliafaucet.com/
- **Goerli**: https://goerlifaucet.com/
- **Mumbai (Polygon)**: https://faucet.polygon.technology/

## Update Frontend

After deploying, update the contract address in your Lovable app:
- Open `src/utils/contracts.ts`
- Replace `CONTRACT_ADDRESS` with your deployed address
- The ABI is already configured

## Network IDs

- Ethereum Mainnet: 1
- Sepolia Testnet: 11155111
- Goerli Testnet: 5
- Polygon Mainnet: 137
- Mumbai Testnet: 80001

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
