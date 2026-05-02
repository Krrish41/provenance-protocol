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

const projectId = '8952458467431e676a161864115f5d81';

// Custom wallet wrappers to provide installation instructions
const customMetaMask = () => {
  const wallet = metaMaskWallet({ projectId });
  return {
    ...wallet,
    downloadUrls: {
      browserExtension: 'https://metamask.io/download/',
    },
    instructions: {
      steps: [
        {
          description: 'Please install the MetaMask extension to proceed.',
          step: 'install',
          title: 'MetaMask Extension Not Found',
        },
      ],
    },
    qrCode: undefined,
  };
};

const customRainbow = () => {
  const wallet = rainbowWallet({ projectId });
  return {
    ...wallet,
    downloadUrls: {
      browserExtension: 'https://rainbow.me/download',
    },
    instructions: {
      steps: [
        {
          description: 'Please install the Rainbow extension to proceed.',
          step: 'install',
          title: 'Rainbow Extension Not Found',
        },
      ],
    },
    qrCode: undefined,
  };
};

const config = getDefaultConfig({
  appName: 'Provenance Protocol',
  projectId,
  chains: [scaiMainnet],
  wallets: [{
    groupName: 'Recommended',
    wallets: [
      customMetaMask,
      customRainbow,
    ],
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
