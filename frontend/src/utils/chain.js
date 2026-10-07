import { defineChain } from 'viem';

export const scaiMainnet = defineChain({
  id: 34,
  name: 'SCAI Mainnet',
  network: 'scai',
  nativeCurrency: {
    decimals: 18,
    name: 'SCAI',
    symbol: 'SCAI',
  },
  rpcUrls: {
    default: { 
      http: [
        'https://mainnet-rpc.scai.network',
        'https://34.rpc.thirdweb.com'
      ] 
    },
    public: { 
      http: [
        'https://mainnet-rpc.scai.network',
        'https://34.rpc.thirdweb.com'
      ] 
    },
  },
  blockExplorers: {
    default: { name: 'SCAI Explorer', url: 'https://explorer.securechain.ai' },
  },
  fees: {
    async estimateFeesPerGas({ publicClient }) {
      if (!publicClient) return { gasPrice: undefined };
      const gasPrice = await publicClient.getGasPrice();
      return { gasPrice };
    },
  },
});

export const SCAI_CHAIN_ID = 34;

/**
 * Ensures the wallet is on SCAI Mainnet.
 * If not, triggers an automatic network switch / addition in the wallet.
 */
export async function ensureSCAINetwork(currentChainId, switchChainAsync) {
  if (currentChainId === SCAI_CHAIN_ID) return true;
  if (!switchChainAsync) {
    throw new Error('Please switch your wallet to SCAI Mainnet (Chain ID 34)');
  }
  try {
    await switchChainAsync({ chainId: SCAI_CHAIN_ID });
    return true;
  } catch (err) {
    // If user rejected or network add failed
    if (err?.code === 4001) {
      throw new Error('Network switch was rejected in wallet');
    }
    throw new Error(err?.shortMessage || err?.message || 'Please switch to SCAI Mainnet in your wallet');
  }
}
