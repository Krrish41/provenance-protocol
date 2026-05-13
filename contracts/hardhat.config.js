import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "paris",
    },
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    scai: {
      url: process.env.SCAI_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      scai: "ANY_STRING",
    },
    customChains: [
      {
        network: "scai",
        chainId: 34,
        urls: {
          apiURL: "https://explorer.securechain.ai/api",
          browserURL: "https://explorer.securechain.ai",
        },
      },
    ],
  },
};
