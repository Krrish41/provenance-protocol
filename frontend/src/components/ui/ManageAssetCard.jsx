import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseEther, parseGwei, formatEther } from 'viem';
import { useWriteContract, usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../../utils/contract';
import toast from 'react-hot-toast';
import { Tag, XCircle, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';

const ManageAssetCard = ({ nft, isListed, onRefresh }) => {
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: 34 });
  const { data: walletClient } = useWalletClient();

  const handleResell = async () => {
    if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) <= 0) {
      return toast.error("Please enter a valid price greater than 0");
    }

    if (chainId !== 34) {
      return toast.error("Please switch to SecureChain AI Mainnet");
    }

    setLoading(true);
    try {
      // Fetch current listing price for the fee
      const listingPrice = await publicClient.readContract({
        address: MARKETPLACE_ADDRESS,
        abi: NFTMarketplaceABI,
        functionName: 'getListingPrice',
      });

      const priceInWei = parseEther(newPrice);

      const hash = await walletClient.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: NFTMarketplaceABI,
        functionName: 'resellToken',
        args: [BigInt(nft.tokenId), priceInWei],
        value: listingPrice,
        chainId: 34,
        type: 'legacy',
        gas: 500000n,
        gasPrice: parseGwei('3.5'),
      });
      
      toast.success("Transaction submitted! Waiting for confirmation...");
      
      await publicClient.waitForTransactionReceipt({ hash });
      
      toast.success("Asset listed on secondary market!");
      setNewPrice('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || "Listing failed. Check your balance.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (chainId !== 34) {
      return toast.error("Please switch to SecureChain AI Mainnet");
    }

    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: NFTMarketplaceABI,
        functionName: 'cancelListing',
        args: [BigInt(nft.tokenId)],
        chainId: 34,
        type: 'legacy',
        gas: 500000n,
        gasPrice: parseGwei('3.5'),
      });
      
      toast.success("Cancellation submitted! Waiting for confirmation...");
      
      await publicClient.waitForTransactionReceipt({ hash });
      
      toast.success("Listing cancelled. NFT returned to your wallet.");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error(err.shortMessage || "Cancellation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-[#1A1A1D] border border-[#4E4E50]/30 rounded-2xl overflow-hidden hover:border-[#66FCF1]/50 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={nft.image} 
          alt={nft.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
            isListed 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
          }`}>
            {isListed ? 'Listed' : 'In Wallet'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-[#66FCF1] transition-colors line-clamp-1">
            {nft.name}
          </h3>
          <span className="text-[#45A29E] text-sm font-mono">#{nft.tokenId}</span>
        </div>
        
        <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
          {nft.description || "No description provided for this asset."}
        </p>

        <div className="space-y-4">
          {isListed ? (
            <div className="pt-4 border-t border-[#4E4E50]/30">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Market Price</p>
                  <p className="text-[#66FCF1] font-bold text-lg">{formatEther(nft.price)} SCAI</p>
                </div>
                <button 
                  onClick={() => window.open(`https://explorer.securechain.ai/token/${MARKETPLACE_ADDRESS}/instance/${nft.tokenId}`, '_blank')}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
              <button 
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <XCircle size={18} />}
                {loading ? "Delisting..." : "Cancel Listing"}
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-[#4E4E50]/30 space-y-3">
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Listing Price (SCAI)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-black/50 border border-[#4E4E50]/50 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:border-[#66FCF1]/50 outline-none transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">
                  SCAI
                </div>
              </div>
              <button 
                onClick={handleResell}
                disabled={loading}
                className="w-full py-3 bg-[#66FCF1] text-[#0B0C10] rounded-xl hover:bg-[#45A29E] transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Tag size={18} />}
                {loading ? "Processing..." : "List on Market"}
              </button>
              <p className="text-[10px] text-gray-500 text-center italic">
                * Requires listing fee of 0.025 SCAI
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default ManageAssetCard;
