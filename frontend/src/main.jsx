import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { createConfig, http, WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { defineChain } from 'viem';
import { injected, walletConnect } from 'wagmi/connectors';

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

const projectId = '8952458467431e676a161864115f5d81';

const config = createConfig({
  chains: [scaiMainnet],
  connectors: [
    injected({ target: 'metaMask' }),
    injected({ target: 'rainbow' }),
    walletConnect({ projectId }),
  ],
  transports: {
    [scaiMainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
