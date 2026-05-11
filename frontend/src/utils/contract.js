import NFTMarketplaceArtifact from './NFTMarketplace.json';

export const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;

// Force-hardcoding the critical functions to prevent JSON sync issues
export const NFTMarketplaceABI = [
  ...NFTMarketplaceArtifact.abi.filter(item => item.name !== 'cancelListing' && item.name !== 'resellToken'),
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "cancelListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "resellToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];
