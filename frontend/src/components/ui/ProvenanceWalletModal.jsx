import { useState, useEffect, useRef } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Download, ExternalLink, ShieldCheck, Wallet, AlertCircle, Smartphone, Globe } from 'lucide-react';

const UI_STATES = {
  DEFAULT: 'DEFAULT',
  INSTALL_METAMASK: 'INSTALL_METAMASK',
  INSTALL_RAINBOW: 'INSTALL_RAINBOW',
  CONNECTING: 'CONNECTING',
  ERROR: 'ERROR',
  MOBILE_INSTALL_REQUIRED: 'MOBILE_INSTALL_REQUIRED',
  MOBILE_ACTION_REQUIRED: 'MOBILE_ACTION_REQUIRED',
  IN_APP_BROWSER: 'IN_APP_BROWSER'
};

const ProvenanceWalletModal = ({ isOpen, onClose }) => {
  const { connect, connectors, error: connectError } = useConnect();
  const { isConnecting, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [uiState, setUiState] = useState(UI_STATES.DEFAULT);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const connectionTimeout = useRef(null);

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isInAppBrowser = typeof navigator !== 'undefined' && /Twitter|Instagram|FBAV|Telegram/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Auto-close on successful connection
  useEffect(() => {
    if (isConnected) {
      if (connectionTimeout.current) clearTimeout(connectionTimeout.current);
      onClose();
    }
  }, [isConnected, onClose]);

  // Aggressive In-App Browser Auto-Connect
  useEffect(() => {
    if (!isConnected && typeof window !== 'undefined' && window.ethereum) {
      // Find the injected connector (generic or specific)
      const injectedConnector = connectors.find(c => 
        c.id === 'injected' || 
        c.name.toLowerCase().includes('metamask') || 
        c.name.toLowerCase().includes('rainbow')
      );

      if (injectedConnector) {
        console.log("[Provenance] Web3 Browser detected. Auto-connecting...");
        connect({ connector: injectedConnector });
      }
    }
  }, [isConnected, connectors, connect]);

  // Handle Wagmi connection errors
  useEffect(() => {
    // CRITICAL: Only trigger error UI if we actually have a selected connector
    if (connectError && selectedConnector) {
      // Ignore non-fatal warnings on desktop
      if (
        connectError.message?.includes('already connected') ||
        connectError.message?.includes('Connector not found') ||
        connectError.message?.includes('Resource unavailable')
      ) {
        return;
      }

      if (connectionTimeout.current) clearTimeout(connectionTimeout.current);
      
      // Only show error screen for actual user rejections or fatal misconfigurations
      const isUserRejection = 
        connectError.name === 'UserRejectedRequestError' || 
        connectError.message?.toLowerCase().includes('user rejected') ||
        connectError.message?.toLowerCase().includes('user denied') ||
        connectError?.code === 4001;

      if (isUserRejection) {
        setUiState(isMobile ? UI_STATES.MOBILE_ACTION_REQUIRED : UI_STATES.ERROR);
      } else {
        // For other errors on desktop, try to reset silently rather than crashing
        if (!isMobile) {
          console.warn("[Provenance] Desktop connection error suppressed:", connectError.message);
          return;
        }
        setUiState(UI_STATES.MOBILE_INSTALL_REQUIRED);
      }
    }
  }, [connectError, isMobile, selectedConnector]);

  // Handle connecting status from Wagmi
  useEffect(() => {
    if (isConnecting && 
        ![UI_STATES.INSTALL_METAMASK, UI_STATES.INSTALL_RAINBOW, UI_STATES.MOBILE_INSTALL_REQUIRED, UI_STATES.IN_APP_BROWSER, UI_STATES.MOBILE_ACTION_REQUIRED].includes(uiState)) {
      setUiState(UI_STATES.CONNECTING);
    }
  }, [isConnecting, uiState]);

  const handleConnectorClick = async (connector) => {
    setSelectedConnector(connector);
    if (connectionTimeout.current) clearTimeout(connectionTimeout.current);

    // 1. MOBILE BRANCH (Strictly isolated)
    if (isMobile) {
      if (isInAppBrowser) {
        setUiState(UI_STATES.IN_APP_BROWSER);
        return;
      }
      setUiState(UI_STATES.MOBILE_ACTION_REQUIRED);
      return;
    }

    // 2. DESKTOP BRANCH (Direct Extension Path)
    const name = connector.name.toLowerCase();
    
    // Safety Net: Check if window.ethereum actually exists
    const hasInjectedProvider = typeof window !== 'undefined' && !!window.ethereum;
    
    if (!hasInjectedProvider) {
      if (name.includes('metamask')) setUiState(UI_STATES.INSTALL_METAMASK);
      else if (name.includes('rainbow')) setUiState(UI_STATES.INSTALL_RAINBOW);
      return;
    }

    // Explicitly target the correct injected connector
    const targetConnector = connectors.find(c => 
      c.id === connector.id || 
      (c.id === 'injected' && c.name.toLowerCase() === name)
    );

    if (!targetConnector) {
      console.error("[Provenance] Desktop connector mismatch");
      return;
    }

    try {
      setUiState(UI_STATES.CONNECTING);
      
      // Wipe stale state before triggering extension
      disconnect(); 
      
      // Execute connection after a micro-tick to ensure disconnect is processed
      setTimeout(() => {
        connect({ connector: targetConnector });
      }, 50);
    } catch (err) {
      // Only show error on explicit rejection
      if (err.name === 'UserRejectedRequestError' || err.code === 4001) {
        setUiState(UI_STATES.ERROR);
      }
    }
  };

  const handleDAppRedirect = () => {
    // Construct the direct DApp link to open the site in the wallet's internal browser
    const dappUrl = window.location.host + window.location.pathname;
    const name = selectedConnector?.name.toLowerCase() || "";
    
    if (name.includes('metamask')) {
      window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
    } else if (name.includes('rainbow')) {
      window.location.href = `https://rnbwapp.com/dapp/${dappUrl}`;
    }
  };

  // Reset modal state on open/close
  useEffect(() => {
    if (!isOpen) {
      if (connectionTimeout.current) clearTimeout(connectionTimeout.current);
      setUiState(UI_STATES.DEFAULT);
      setSelectedConnector(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter out generic WalletConnect and the generic "Injected" provider
  const visibleConnectors = connectors
    .filter((connector, index, self) => 
      index === self.findIndex((c) => c.name === connector.name)
    )
    .filter(c => 
      c.id !== 'walletConnect' && 
      c.name.toLowerCase() !== 'injected'
    );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
        className="relative bg-[#0B0C10] border border-[#45A29E] rounded-lg w-full max-w-2xl flex flex-col md:flex-row min-h-[460px] max-h-[85vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#45A29E] hover:text-[#66FCF1] transition-colors z-20"
        >
          <X size={24} />
        </button>

        {/* Left Pane - Provider List */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#45A29E]/30 p-6 flex flex-col gap-4">
          <h3 className="text-[#66FCF1] font-mono text-xs uppercase tracking-[0.2em] mb-4">Select Provider</h3>
          <div className="flex flex-col gap-2">
            {visibleConnectors.map((connector) => (
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
          <div className="mt-auto pt-6 border-t border-[#45A29E]/10 hidden md:block">
            <div className="flex items-center gap-2 text-[#45A29E] text-[10px] font-mono uppercase tracking-widest">
              <ShieldCheck size={12} />
              Secure Auth
            </div>
          </div>
        </div>

        {/* Right Pane - Dynamic States */}
        <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center text-center relative bg-[#0B0C10]">
          <AnimatePresence mode="wait">
            {uiState === UI_STATES.DEFAULT ? (
              <motion.div 
                key="default"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-4 py-8 md:py-0"
              >
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#45A29E]/30 flex items-center justify-center text-[#45A29E]">
                  <Wallet size={32} />
                </div>
                <p className="text-[#45A29E] font-mono text-sm max-w-[200px] leading-relaxed">
                  {isMobile ? 'Tap a provider to start.' : 'Select a provider from the menu to authenticate.'}
                </p>
              </motion.div>
            ) : uiState === UI_STATES.MOBILE_ACTION_REQUIRED ? (
              <motion.div 
                key="mobile-action"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-6 w-full py-4"
              >
                <div className="w-20 h-20 bg-[#66FCF1]/10 rounded-2xl flex items-center justify-center text-[#66FCF1] border border-[#66FCF1]/30">
                  <Wallet size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-[#C5C6C7] text-2xl font-bold">Connect Mobile App</h2>
                  <p className="text-[#45A29E] text-[10px] font-mono uppercase tracking-[0.2em]">{selectedConnector?.name} Selected</p>
                </div>
                
                <div className="flex flex-col gap-3 w-full max-w-[280px]">
                  <button 
                    onClick={handleDAppRedirect}
                    className="w-full bg-[#66FCF1] text-[#0B0C10] py-2.5 px-4 rounded text-sm font-semibold tracking-wide uppercase text-center shadow-[0_0_20px_rgba(102,252,241,0.2)] transition-all active:scale-95"
                  >
                    Open {selectedConnector?.name} App
                  </button>
                  
                  <a 
                    href={selectedConnector?.name.toLowerCase().includes('metamask') ? 'https://metamask.io/download/' : 'https://rainbow.me/download/'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full border border-[#45A29E]/50 text-[#45A29E] py-2.5 px-4 rounded text-sm font-semibold tracking-wide uppercase hover:text-[#66FCF1] hover:border-[#66FCF1] transition-all"
                  >
                    Get {selectedConnector?.name}
                  </a>
                </div>
              </motion.div>
            ) : uiState === UI_STATES.IN_APP_BROWSER ? (
              <motion.div 
                key="in-app"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="w-20 h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/30">
                  <Globe size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-orange-500 text-xl font-bold uppercase tracking-tight">In-App Browser Detected</h2>
                  <p className="text-[#C5C6C7] text-sm max-w-[280px]">
                    Social browsers block secure wallet links. Please tap the <span className="font-bold text-white">(•••)</span> menu and select <span className="font-bold text-white">"Open in System Browser"</span> to continue.
                  </p>
                </div>
              </motion.div>
            ) : uiState === UI_STATES.MOBILE_INSTALL_REQUIRED ? (
              <motion.div 
                key="mobile-install"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="w-20 h-20 bg-[#66FCF1]/10 rounded-2xl flex items-center justify-center text-[#66FCF1] border border-[#66FCF1]/30">
                  <Smartphone size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-[#C5C6C7] text-xl font-bold">{selectedConnector?.name} Not Found</h2>
                  <p className="text-[#45A29E] text-sm max-w-[280px]">To connect, please install the official mobile app for your device.</p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-[240px]">
                  <a 
                    href={isIOS ? 'https://apps.apple.com/app/metamask/id1438144202' : 'https://play.google.com/store/apps/details?id=io.metamask'}
                    target="_blank"
                    rel="noreferrer"
                    className="provenance-btn !py-3 flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {isIOS ? 'App Store' : 'Google Play'}
                  </a>
                  <button 
                    onClick={() => {
                      setUiState(UI_STATES.DEFAULT);
                      setSelectedConnector(null);
                    }}
                    className="text-[#45A29E] text-xs font-mono hover:text-[#66FCF1]"
                  >
                    Back to List
                  </button>
                </div>
              </motion.div>
            ) : (uiState === UI_STATES.INSTALL_METAMASK || uiState === UI_STATES.INSTALL_RAINBOW) ? (
              <motion.div 
                key="install"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
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
                    className="provenance-btn !py-3 font-bold"
                  >
                    Install {uiState === UI_STATES.INSTALL_METAMASK ? 'MetaMask' : 'Rainbow'}
                    <ExternalLink size={16} className="ml-2" />
                  </a>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-[#45A29E] text-xs font-mono hover:text-[#66FCF1] transition-colors underline underline-offset-4"
                  >
                    I installed it - Refresh
                  </button>
                </div>
              </motion.div>
            ) : uiState === UI_STATES.ERROR || (connectError && uiState !== UI_STATES.MOBILE_INSTALL_REQUIRED) ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="text-red-500 mb-2">
                  <AlertCircle size={48} />
                </div>
                <h3 className="text-white font-bold text-lg">Connection Failed</h3>
                <p className="text-[#45A29E] text-sm max-w-[220px]">The connection was aborted or timed out. Please try again.</p>
                <button 
                  onClick={() => {
                    setUiState(isMobile ? UI_STATES.MOBILE_ACTION_REQUIRED : UI_STATES.DEFAULT);
                    setSelectedConnector(null);
                  }}
                  className="mt-4 text-[#66FCF1] text-xs uppercase tracking-widest hover:underline"
                >
                  Back to List
                </button>
              </motion.div>
            ) : uiState === UI_STATES.CONNECTING ? (
              <motion.div 
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                  <h3 className="text-white text-lg font-mono animate-pulse uppercase tracking-wider">
                    {isMobile ? 'Opening Wallet...' : 'Awaiting Signature...'}
                  </h3>
                  <p className="text-[#45A29E] text-xs">
                    {isMobile ? 'Please approve the connection in your wallet app.' : 'Confirm the connection request in your wallet.'}
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ProvenanceWalletModal;
