import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { defineChain } from 'viem';

import App from './App.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary';

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
    default: { http: ['https://34.rpc.thirdweb.com'] },
    public: { http: ['https://34.rpc.thirdweb.com'] },
  },
});

import { metaMaskWallet, rainbowWallet } from '@rainbow-me/rainbowkit/wallets';

const config = getDefaultConfig({
  appName: 'Provenance Protocol',
  projectId: 'YOUR_PROJECT_ID', // Replaced with a generic placeholder for testing
  chains: [scaiMainnet],
  wallets: [{
    groupName: 'Recommended',
    wallets: [metaMaskWallet, rainbowWallet],
  }],
  ssr: false,
});
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#66FCF1',
          accentColorForeground: '#0B0C10',
          borderRadius: 'small',
        })}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
