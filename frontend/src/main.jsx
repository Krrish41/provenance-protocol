import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { createConfig, http, fallback, WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { defineChain } from 'viem';
import { injected, walletConnect } from 'wagmi/connectors';

import App from './App.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { WalletModalProvider } from './context/WalletModalContext';

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
});

const config = createConfig({
  chains: [scaiMainnet],
  connectors: [
    injected(), 
    injected({ target: 'metaMask' }),
    injected({ target: 'rainbow' }),
    walletConnect({ 
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '3fcc6b4468bd93359a443e62f559609c',
      showQrModal: false,
      metadata: {
        name: 'Provenance Marketplace',
        description: 'SCAI NFT Marketplace',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://provenance.protocol',
        icons: ['https://provenance.protocol/logo.png']
      }
    }),
  ],
  transports: {
    [scaiMainnet.id]: fallback([
      http(import.meta.env.VITE_SCAI_RPC_FALLBACK || 'https://mainnet-rpc.scai.network', {
        retryCount: 10,
        retryDelay: 2000,
        timeout: 20000,
      }),
      http(import.meta.env.VITE_SCAI_RPC_URL || 'https://34.rpc.thirdweb.com', {
        retryCount: 10,
        retryDelay: 3000,
        timeout: 20000,
      }),
    ], { rank: true }),
  },
  pollingInterval: 5000,
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletModalProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </WalletModalProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
