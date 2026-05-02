import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Cpu, Database } from 'lucide-react';

const NFTModal = ({ nft, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0B0C10]/95 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-[#1e2024] border border-[#45A29E]/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-[#0B0C10]/50 hover:bg-[#66FCF1] hover:text-[#0B0C10] rounded-full transition-all text-white"
          >
            <X size={24} />
          </button>

          {/* Left: Image Section */}
          <div className="w-full md:w-3/5 bg-[#0B0C10] relative flex items-center justify-center min-h-[300px]">
            <img 
              src={nft.image} 
              alt={nft.name} 
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-6 left-6 flex gap-2">
                <span className="bg-[#66FCF1]/10 border border-[#66FCF1]/30 text-[#66FCF1] px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-widest flex items-center gap-2">
                    <ShieldCheck size={12} /> Authenticity Verified
                </span>
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="w-full md:w-2/5 p-8 overflow-y-auto custom-scrollbar">
            <div className="mb-8">
              <span className="text-[#45A29E] font-mono text-xs uppercase tracking-[0.2em] mb-2 block">
                Provenance Asset // ID-{nft.tokenId}
              </span>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">{nft.name}</h2>
              <div className="flex items-center gap-4 text-sm font-mono">
                <div className="flex flex-col">
                    <span className="text-[#45A29E] text-[10px] uppercase">Protocol Value</span>
                    <span className="text-[#66FCF1] text-xl font-bold">{nft.price} SCAI</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-[#C5C6C7] font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Database size={14} className="text-[#66FCF1]" /> Technical Specifications
                </h4>
                <p className="text-[#C5C6C7]/80 text-sm leading-relaxed font-sans">
                  {nft.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 border-y border-[#45A29E]/10">
                <div className="bg-[#0B0C10]/30 p-3 rounded-lg border border-[#45A29E]/10">
                    <span className="text-[#45A29E] text-[9px] uppercase block mb-1">Contract Address</span>
                    <span className="text-white text-[10px] font-mono truncate block">Verified on SCAI</span>
                </div>
                <div className="bg-[#0B0C10]/30 p-3 rounded-lg border border-[#45A29E]/10">
                    <span className="text-[#45A29E] text-[9px] uppercase block mb-1">Standard</span>
                    <span className="text-white text-[10px] font-mono block">ERC-721 Secure</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-[#45A29E] text-xs">
                    <Cpu size={14} />
                    <span>Blockchain: SCAI Mainnet</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NFTModal;
