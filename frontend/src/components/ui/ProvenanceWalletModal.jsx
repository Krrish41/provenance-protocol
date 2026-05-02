import { useState, useEffect } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Download, ExternalLink, ShieldCheck, Wallet } from 'lucide-react';

const UI_STATES = {
  DEFAULT: 'DEFAULT',
  INSTALL_METAMASK: 'INSTALL_METAMASK',
  INSTALL_RAINBOW: 'INSTALL_RAINBOW',
  CONNECTING: 'CONNECTING',
  ERROR: 'ERROR'
};

const ProvenanceWalletModal = ({ isOpen, onClose }) => {
  const { connect, connectors, error: connectError } = useConnect();
  const { isConnecting, isConnected } = useAccount();
  const [uiState, setUiState] = useState(UI_STATES.DEFAULT);
  const [selectedConnector, setSelectedConnector] = useState(null);

  useEffect(() => {
    if (isConnected) {
      onClose();
    }
  }, [isConnected, onClose]);

  // Only trigger CONNECTING state if we aren't in an INSTALL state
  useEffect(() => {
    if (isConnecting && uiState !== UI_STATES.INSTALL_METAMASK && uiState !== UI_STATES.INSTALL_RAINBOW) {
      setUiState(UI_STATES.CONNECTING);
    }
  }, [isConnecting, uiState]);

  const handleConnectorClick = (connector) => {
    setSelectedConnector(connector);
    
    // STRICT Detection Override Logic
    const isMetaMask = !!window.ethereum?.isMetaMask;
    const isRainbow = !!window.ethereum?.isRainbow;
    const name = connector.name.toLowerCase();

    // MetaMask Detection
    if (name.includes('metamask')) {
      if (!isMetaMask) {
        setUiState(UI_STATES.INSTALL_METAMASK);
        return;
      }
    }

    // Rainbow Detection
    if (name.includes('rainbow')) {
      if (!isRainbow) {
        setUiState(UI_STATES.INSTALL_RAINBOW);
        return;
      }
    }

    // If we reach here, we assume the wallet is present
    try {
      setUiState(UI_STATES.CONNECTING);
      connect({ connector });
    } catch (err) {
      setUiState(UI_STATES.ERROR);
    }
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setUiState(UI_STATES.DEFAULT);
      setSelectedConnector(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const uniqueConnectors = connectors.filter((connector, index, self) => 
    index === self.findIndex((c) => c.name === connector.name)
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-[#0B0C10] border border-[#45A29E] rounded-lg w-full max-w-2xl flex min-h-[460px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#45A29E] hover:text-[#66FCF1] transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="w-1/3 border-r border-[#45A29E]/30 p-6 flex flex-col gap-4">
          <h3 className="text-[#66FCF1] font-mono text-xs uppercase tracking-[0.2em] mb-4">Select Provider</h3>
          <div className="flex flex-col gap-2">
            {uniqueConnectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => handleConnectorClick(connector)}
                className={`flex items-center gap-3 p-3 rounded border transition-all duration-200 text-left ${
                  selectedConnector?.id === connector.id 
                    ? 'bg-[#66FCF1]/10 border-[#66FCF1] text-[#66FCF1]' 
                    : 'bg-[#1e2024]/50 border-transparent text-[#C5C6C7] hover:border-[#45A29E] hover:bg-[#1e2024]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#0B0C10] flex items-center justify-center border border-[#45A29E]/30">
                  <Wallet size={16} />
                </div>
                <span className="font-mono text-sm">{connector.name}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-auto pt-6 border-t border-[#45A29E]/10">
            <div className="flex items-center gap-2 text-[#45A29E] text-[10px] font-mono uppercase tracking-widest">
              <ShieldCheck size={12} />
              Secure Auth
            </div>
          </div>
        </div>

        <div className="flex-1 p-10 flex flex-col items-center justify-center text-center relative bg-[#0B0C10]">
          <AnimatePresence mode="wait">
            {uiState === UI_STATES.DEFAULT && (
              <motion.div 
                key="default"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#45A29E]/30 flex items-center justify-center text-[#45A29E]">
                  <Wallet size={32} />
                </div>
                <p className="text-[#45A29E] font-mono text-sm max-w-[200px] leading-relaxed">
                  Select a provider from the menu to authenticate.
                </p>
              </motion.div>
            )}

            {(uiState === UI_STATES.INSTALL_METAMASK || uiState === UI_STATES.INSTALL_RAINBOW) && (
              <motion.div 
                key="install"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="w-20 h-20 bg-[#66FCF1]/10 rounded-2xl flex items-center justify-center text-[#66FCF1] border border-[#66FCF1]/30">
                  <Download size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-[#C5C6C7] text-2xl font-bold tracking-tight">
                    {uiState === UI_STATES.INSTALL_METAMASK ? 'MetaMask Not Detected' : 'Rainbow Not Detected'}
                  </h2>
                  <p className="text-[#45A29E] text-sm max-w-[280px] mx-auto">
                    You must install the browser extension to interact with the SCAI Mainnet.
                  </p>
                </div>
                
                <div className="flex flex-col gap-4 w-full max-w-[240px]">
                  <a 
                    href={uiState === UI_STATES.INSTALL_METAMASK ? 'https://metamask.io/download/' : 'https://rainbow.me/download'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#66FCF1] text-[#0B0C10] py-3 px-6 rounded font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition-all"
                  >
                    Install {uiState === UI_STATES.INSTALL_METAMASK ? 'MetaMask' : 'Rainbow'}
                    <ExternalLink size={16} />
                  </a>
                  
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-[#45A29E] text-xs font-mono hover:text-[#66FCF1] transition-colors underline decoration-[#45A29E]/30 underline-offset-4"
                  >
                    I installed it - Refresh
                  </button>
                </div>
              </motion.div>
            )}

            {uiState === UI_STATES.CONNECTING && (
              <motion.div 
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-[#66FCF1] rounded-full blur-xl"
                  />
                  <div className="relative w-20 h-20 rounded-full border-2 border-[#66FCF1] flex items-center justify-center">
                    <Loader2 size={32} className="text-[#66FCF1] animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-white text-lg font-mono animate-pulse">Awaiting Signature...</h3>
                  <p className="text-[#45A29E] text-xs">Confirm the connection request in your wallet.</p>
                </div>
              </motion.div>
            )}

            {(uiState === UI_STATES.ERROR || connectError) && (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="text-red-500 mb-2">
                  <X size={48} />
                </div>
                <h3 className="text-white font-bold">Connection Failed</h3>
                <p className="text-[#45A29E] text-sm">Please try again or select another wallet.</p>
                <button 
                  onClick={() => setUiState(UI_STATES.DEFAULT)}
                  className="mt-2 text-[#66FCF1] text-xs uppercase tracking-widest hover:underline"
                >
                  Back to List
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ProvenanceWalletModal;
