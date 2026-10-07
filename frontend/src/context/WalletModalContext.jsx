import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const WalletModalContext = createContext();

export const WalletModalProvider = ({ children }) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const openWalletModal = useCallback(() => setIsWalletModalOpen(true), []);
  const closeWalletModal = useCallback(() => setIsWalletModalOpen(false), []);

  const value = useMemo(() => ({ 
    isWalletModalOpen, 
    openWalletModal, 
    closeWalletModal 
  }), [isWalletModalOpen, openWalletModal, closeWalletModal]);

  return (
    <WalletModalContext.Provider value={value}>
      {children}
    </WalletModalContext.Provider>
  );
};

export const useWalletModal = () => {
  const context = useContext(WalletModalContext);
  if (!context) {
    throw new Error('useWalletModal must be used within a WalletModalProvider');
  }
  return context;
};
