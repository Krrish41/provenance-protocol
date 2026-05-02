# Provenance Protocol

Welcome to the **Provenance Protocol**, a full-stack, decentralized NFT Marketplace deployed on the SCAI mainnet.

This platform is built with a focus on security, gas efficiency, and a premium user experience. It allows users to easily mint, list, discover, and purchase NFTs in a decentralized manner.

## 🚀 Live Demo

**Vercel Deployment:** [https://provenance-protocol.vercel.app](https://provenance-protocol.vercel.app) *(Link to be updated upon successful Vercel deployment)*

## 🛠️ Technology Stack

* **Smart Contracts:** Solidity (^0.8.20), Hardhat, OpenZeppelin (ERC-721, ReentrancyGuard)
* **Frontend:** React.js (Vite), TailwindCSS v4
* **Web3 Integration:** Ethers.js v6, Wagmi, RainbowKit (for seamless MetaMask & WalletConnect support)
* **Storage:** IPFS via Pinata API (for NFT metadata and assets)

## 📋 Features

* **Minting NFTs:** Users can upload images directly to IPFS and mint them as ERC-721 tokens.
* **Listing & Selling:** Creators and owners can list their NFTs on the marketplace by setting an asking price.
* **Buying NFTs:** Users can purchase listed NFTs securely. The smart contract automatically transfers ownership and funds (including listing fees to the marketplace owner).
* **Dashboard:** A comprehensive user dashboard to view owned and currently listed NFTs.

## ⚙️ Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Krrish41/provenance-protocol.git
cd provenance-protocol
```

### 2. Smart Contracts Setup
```bash
cd contracts
npm install
npx hardhat node
```
In a new terminal window, deploy the contracts:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Variables
You will need to set up environment variables for both the `contracts/` and `frontend/` directories.

**Frontend (`frontend/.env`):**
```env
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_MARKETPLACE_ADDRESS=deployed_contract_address
```

**Contracts (`contracts/.env`):**
```env
SCAI_RPC_URL=your_scai_mainnet_rpc_url
PRIVATE_KEY=your_deployment_wallet_private_key
```

## 🔒 Security & Architecture

The core marketplace contract (`NFTMarketplace.sol`) is engineered with security best practices:
- **Reentrancy Protection:** All state-changing functions that deal with value transfer use OpenZeppelin's `ReentrancyGuard`.
- **Gas Optimization:** Implements custom errors instead of `require` statements to significantly reduce gas costs during transactions.

## 📄 License

This project is licensed under the MIT License.
