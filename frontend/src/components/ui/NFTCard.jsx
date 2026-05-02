import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Boxes } from 'lucide-react';

const NFTCard = ({ item, onAction, onClick }) => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const isUserOwner = isConnected && address && (
    (item.seller && item.seller.toLowerCase() === address.toLowerCase()) || 
    (item.owner && item.owner.toLowerCase() === address.toLowerCase())
  );

  const getButtonState = () => {
    if (!isConnected) return { text: 'Connect Wallet', action: openConnectModal, disabled: false };
    if (isUserOwner) return { text: 'Owned by You', action: () => {}, disabled: true };
    return { text: 'Buy Asset', action: () => onAction(item), disabled: false };
  };

  const button = getButtonState();

  const handleAction = async (e) => {
    e.stopPropagation();
    try {
      await button.action();
    } catch (err) {
      console.error("Action execution failed:", err);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -10, boxShadow: '0 10px 30px -10px rgba(102,252,241,0.3)' }}
      onClick={() => onClick && onClick(item)}
      className="bg-[#1e2024]/80 border border-[#45A29E]/30 rounded-xl overflow-hidden backdrop-blur-sm flex flex-col interactive cursor-pointer group"
    >
      <div className="relative aspect-square overflow-hidden bg-[#0B0C10]">
        {item.isPending ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#1e2024]">
            <div className="w-12 h-12 border-2 border-[#66FCF1]/30 border-t-[#66FCF1] rounded-full animate-spin mb-4" />
            <p className="text-xs text-[#45A29E] uppercase tracking-tighter">Synchronizing...</p>
          </div>
        ) : item.isFailed ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#1e2024]/50 border-b border-[#45A29E]/10">
            <div className="w-12 h-12 bg-[#45A29E]/10 rounded-full flex items-center justify-center mb-4 border border-[#45A29E]/20">
              <Boxes className="w-6 h-6 text-[#45A29E]" />
            </div>
            <p className="text-[10px] text-[#45A29E] uppercase tracking-widest leading-relaxed">Media Synchronization<br/>Pending Verification</p>
          </div>
        ) : (
          <img 
            src={item.image} 
            alt={item.name} 
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
          />
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
        <p className={`text-[#C5C6C7] text-sm mb-4 line-clamp-2 flex-grow ${item.isPending || item.isFailed ? 'italic opacity-60' : ''}`}>
          {item.description}
        </p>
        
        <div className="flex justify-between items-end mt-auto">
          <div>
            <p className="text-xs text-[#45A29E] uppercase tracking-wider mb-1">Price</p>
            <p className="text-lg font-bold text-[#66FCF1]">{item.price} SCAI</p>
          </div>
          <button 
            onClick={handleAction}
            disabled={button.disabled || item.isPending}
            className={`px-4 py-2 rounded btn-primary text-sm interactive ${
              (button.disabled || item.isPending) ? 'opacity-50' : ''
            }`}
          >
            {item.isPending ? 'Syncing...' : button.text}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NFTCard;

