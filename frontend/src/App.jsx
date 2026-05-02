import { useState } from 'react'
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'SCAI NFT Marketplace',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false, 
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col items-center">
            <header className="w-full p-6 flex justify-between items-center border-b border-slate-800">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
                Provenance Protocol
              </h1>
              {/* Note: Web3Modal / RainbowKit connect button component */}
              <div className="flex items-center gap-4">
                 <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors">
                   Connect Wallet
                 </button>
              </div>
            </header>
            
            <main className="flex-1 w-full max-w-7xl p-8 flex flex-col items-center justify-center text-center">
              <h2 className="text-5xl font-extrabold mb-6 leading-tight">
                Discover, Collect, and Sell <br/>
                <span className="text-indigo-400">Extraordinary NFTs</span>
              </h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl">
                The premier marketplace on the SCAI mainnet for digital assets. Secure, fast, and optimized for gas efficiency.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-transform hover:scale-105">
                  Explore Market
                </button>
                <button className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-lg transition-transform hover:scale-105">
                  Mint NFT
                </button>
              </div>
            </main>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
