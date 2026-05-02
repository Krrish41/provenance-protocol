import { createContext, useContext, useState } from 'react';

const WalletModalContext = createContext();

export const WalletModalProvider = ({ children }) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  return (
    <WalletModalContext.Provider value={{ isWalletModalOpen, openWalletModal, closeWalletModal }}>
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
