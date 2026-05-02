import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Cpu, Database, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWalletModal } from '../../context/WalletModalContext';

const NFTModal = ({ nft, isOpen, onClose, onAction }) => {
  const { address, isConnected } = useAccount();
  const { openWalletModal } = useWalletModal();

  if (!isOpen) return null;

  const isUserOwner = isConnected && address && (
    (nft.seller && nft.seller.toLowerCase() === address.toLowerCase()) || 
    (nft.owner && nft.owner.toLowerCase() === address.toLowerCase())
  );

  const getButtonState = () => {
    if (!isConnected) return { text: 'Connect Wallet', action: openWalletModal, disabled: false };
    if (isUserOwner) return { text: 'Owned by You', action: () => {}, disabled: true };
    return { text: 'Buy Asset', action: () => onAction(nft), disabled: false };
  };

  const button = getButtonState();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0B0C10]/60 backdrop-blur-md"
        />
        
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-[#0B0C10]/95 border border-[#45A29E]/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] backdrop-blur-xl"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-[#0B0C10]/80 hover:bg-[#66FCF1] hover:text-[#0B0C10] rounded-full transition-all text-white border border-[#45A29E]/20"
            >
              <X size={20} />
            </button>

            {/* Left: Image Section */}
            <div className="w-full md:w-3/5 bg-black/40 relative flex items-center justify-center min-h-[250px] sm:min-h-[300px] md:h-auto border-b md:border-b-0 md:border-r border-[#45A29E]/10">
              {nft.isPending ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-[#66FCF1]/30 border-t-[#66FCF1] rounded-full animate-spin mb-4" />
                  <p className="text-xs md:text-sm text-[#45A29E] uppercase tracking-widest font-mono">Syncing Media...</p>
                </div>
              ) : (
                <img 
                  src={nft.image} 
                  alt={nft.name} 
                  className="w-full h-full max-h-[40vh] md:max-h-full object-contain p-4 md:p-8"
                />
              )}
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex gap-2">
                  <span className="bg-[#66FCF1]/10 border border-[#66FCF1]/30 text-[#66FCF1] px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] uppercase font-mono tracking-widest flex items-center gap-1.5 md:gap-2 backdrop-blur-md">
                      <ShieldCheck size={10} className="md:w-[12px]" /> Protocol Verified
                  </span>
              </div>
            </div>

            {/* Right: Info Section */}
            <div className="w-full md:w-2/5 p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="mb-6 md:mb-8">
                <span className="text-[#45A29E] font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3 block opacity-70">
                  Network Asset // ID-{nft.tokenId}
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 leading-tight tracking-tight">{nft.name}</h2>
                
                <div className="p-3 md:p-4 bg-[#66FCF1]/5 border border-[#66FCF1]/20 rounded-xl">
                  <span className="text-[#45A29E] text-[9px] md:text-[10px] uppercase font-mono block mb-1">Current Valuation</span>
                  <span className="text-[#66FCF1] text-2xl md:text-3xl font-bold font-mono">{nft.price} <span className="text-xs md:text-sm font-normal opacity-70">SCAI</span></span>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6 flex-grow">
                <div>
                  <h4 className="text-[#C5C6C7] font-bold text-[10px] md:text-xs uppercase tracking-wider mb-2 md:mb-3 flex items-center gap-2">
                    <Database size={12} className="text-[#66FCF1] md:w-[14px]" /> Description
                  </h4>
                  <p className="text-[#C5C6C7]/70 text-xs md:text-sm leading-relaxed font-sans">
                    {nft.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-white/5 p-2 md:p-3 rounded-lg border border-[#45A29E]/10 text-center md:text-left">
                      <span className="text-[#45A29E] text-[8px] md:text-[9px] uppercase block mb-1 font-mono">Chain</span>
                      <span className="text-white text-[9px] md:text-[10px] font-mono block">SCAI Mainnet</span>
                  </div>
                  <div className="bg-white/5 p-2 md:p-3 rounded-lg border border-[#45A29E]/10 text-center md:text-left">
                      <span className="text-[#45A29E] text-[8px] md:text-[9px] uppercase block mb-1 font-mono">Standard</span>
                      <span className="text-white text-[9px] md:text-[10px] font-mono block">ERC-721</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-[#45A29E]/10">
                <button 
                  onClick={button.action}
                  disabled={button.disabled || nft.isPending}
                  className={`provenance-btn w-full !py-3.5 md:!py-4 !text-xs md:!text-sm ${
                    (button.disabled || nft.isPending) ? 'opacity-50' : ''
                  }`}
                >
                  {nft.isPending ? (
                    <>Syncing Protocol...</>
                  ) : (
                    <>
                      <Wallet size={16} className="md:w-[18px] mr-2" />
                      {button.text}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
  );
};

export default NFTModal;
