import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

const NFTCard = ({ item, onAction }) => {
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

  return (
    <motion.div 
      whileHover={{ y: -10, boxShadow: '0 10px 30px -10px rgba(102,252,241,0.3)' }}
      className="bg-[#1e2024]/80 border border-[#45A29E]/30 rounded-xl overflow-hidden backdrop-blur-sm flex flex-col interactive"
    >
      <div className="relative aspect-square overflow-hidden bg-[#0B0C10]">
        <img 
          src={item.image} 
          alt={item.name} 
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
        <p className="text-[#C5C6C7] text-sm mb-4 line-clamp-2 flex-grow">{item.description}</p>
        
        <div className="flex justify-between items-end mt-auto">
          <div>
            <p className="text-xs text-[#45A29E] uppercase tracking-wider mb-1">Price</p>
            <p className="text-lg font-bold text-[#66FCF1]">{item.price} SCAI</p>
          </div>
          <button 
            onClick={button.action}
            disabled={button.disabled}
            className={`px-4 py-2 rounded transition-colors font-bold text-sm uppercase tracking-wide interactive ${
              button.disabled 
                ? 'bg-[#45A29E]/10 border border-[#45A29E]/30 text-[#45A29E] cursor-not-allowed' 
                : 'bg-[#66FCF1]/10 border border-[#66FCF1] text-[#66FCF1] hover:bg-[#66FCF1] hover:text-[#0B0C10]'
            }`}
          >
            {button.text}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NFTCard;

