import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { parseEther, parseGwei, formatEther } from 'viem';
import { usePublicClient, useWalletClient, useChainId, useAccount } from 'wagmi';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../../utils/contract';
import toast from 'react-hot-toast';
import { Tag, XCircle, RefreshCw, ChevronUp, DollarSign } from 'lucide-react';

const ManagementNFTCard = ({ item, isListed, onRefresh, onClick }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: 34 });
  const { data: walletClient } = useWalletClient();

  // Debug: Monitor address state
  useEffect(() => {
    if (isHovered && item && address) {
      console.log("Card Debug:", {
        tokenId: item.tokenId,
        itemSeller: item.seller?.toLowerCase(),
        connectedAddress: address?.toLowerCase(),
        isMatch: item.seller?.toLowerCase() === address?.toLowerCase()
      });
    }
  }, [isHovered, item, address]);

  const handleResell = async (e) => {
    e.stopPropagation();
    if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) <= 0) {
      return toast.error("Enter a valid price");
    }

    if (chainId !== 34) return toast.error("Switch to SecureChain AI Mainnet");
    if (!address) return toast.error("Wallet not connected");

    setLoading(true);
    try {
      const listingPrice = await publicClient.readContract({
        address: MARKETPLACE_ADDRESS,
        abi: NFTMarketplaceABI,
        functionName: 'getListingPrice',
      });

      const hash = await walletClient.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: NFTMarketplaceABI,
        functionName: 'resellToken',
        args: [BigInt(item.tokenId), parseEther(newPrice)],
        value: listingPrice,
        chainId: 34,
        type: 'legacy',
        gas: 500000n,
        gasPrice: parseGwei('3.5'),
        account: address,
      });
      
      const loadingToast = toast.loading("Relisting asset on-chain...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      toast.dismiss(loadingToast);

      if (receipt.status === 'reverted') {
        throw new Error("Transaction reverted on-chain. Please check if you are the owner.");
      }

      toast.success("Asset listed on market!");
      setNewPrice('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Resell error:", err);
      toast.error(err.shortMessage || err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (e) => {
    e.stopPropagation();
    if (chainId !== 34) return toast.error("Switch to SecureChain AI Mainnet");
    if (!address || !walletClient) return toast.error("Wallet not connected");

    setLoading(true);
    try {
      // 1. Fetch deep ownership state
      const [marketItems, actualOwner] = await Promise.all([
        publicClient.readContract({
          address: MARKETPLACE_ADDRESS,
          abi: NFTMarketplaceABI,
          functionName: 'fetchMarketItems',
        }),
        publicClient.readContract({
          address: MARKETPLACE_ADDRESS,
          abi: NFTMarketplaceABI,
          functionName: 'ownerOf',
          args: [BigInt(item.tokenId)]
        }).catch(() => "Unknown/Not Minted")
      ]);

      const currentItem = marketItems.find(i => Number(i.tokenId) === Number(item.tokenId));
      
      console.log("🚨 DEEP OWNERSHIP CHECK:", {
        tokenId: item.tokenId,
        sellerInMapping: currentItem?.seller?.toLowerCase(),
        ownerInMapping: currentItem?.owner?.toLowerCase(),
        actualOwnerOfToken: actualOwner.toLowerCase(),
        marketplaceAddress: MARKETPLACE_ADDRESS.toLowerCase(),
        isContractOwner: actualOwner.toLowerCase() === MARKETPLACE_ADDRESS.toLowerCase()
      });

      if (!currentItem) {
        throw new Error("Listing not found in market data.");
      }

      if (actualOwner.toLowerCase() !== MARKETPLACE_ADDRESS.toLowerCase()) {
        throw new Error("Contract Custody Error: The marketplace contract does not actually hold this NFT ID. It may have been transferred elsewhere.");
      }

      if (currentItem.seller.toLowerCase() !== address.toLowerCase()) {
        throw new Error(`Owner Mismatch! You are ${address.slice(0,6)}, but seller is ${currentItem.seller.slice(0,6)}`);
      }

      const hash = await walletClient.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: NFTMarketplaceABI,
        functionName: 'cancelListing',
        args: [BigInt(item.tokenId)],
        chainId: 34,
        type: 'legacy',
        gas: 600000n,
        gasPrice: parseGwei('3.5'),
        account: address,
      });
      
      const loadingToast = toast.loading("Cancelling listing on-chain...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      toast.dismiss(loadingToast);

      if (receipt.status === 'reverted') {
        throw new Error("Blockchain Revert: The network rejected this transaction. This usually means the NFT state is out of sync.");
      }

      toast.success("Listing removed!");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error(err.shortMessage || err.message || "Cancellation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative bg-[#1e2024]/80 border border-[#45A29E]/30 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col group h-full transition-all duration-300"
    >
      {/* Optimized Shadow using Pseudo-element */}
      <div className="absolute inset-0 rounded-2xl shadow-[0_10px_40px_-10px_rgba(102,252,241,0.4)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
      
      {/* Image Section - Clicking here still expands */}
      <div 
        onClick={() => onClick(item)}
        className="relative aspect-square overflow-hidden cursor-pointer"
      >
        <img 
          src={item.image} 
          alt={item.name} 
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${
            isListed 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-[#66FCF1]/20 text-[#66FCF1] border-[#66FCF1]/30'
          }`}>
            {isListed ? 'Active Listing' : 'In Wallet'}
          </span>
        </div>

        {/* Premium Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-0 bg-[#0B0C10]/90 backdrop-blur-md z-20 p-6 flex flex-col justify-center items-center text-center"
            >
              <div className="w-full space-y-6">
                <div className="space-y-1">
                  <h4 className="text-[#66FCF1] text-xs font-bold uppercase tracking-[0.2em]">Management Interface</h4>
                  <p className="text-white text-lg font-bold truncate px-2">{item.name}</p>
                </div>

                {isListed ? (
                  <div className="space-y-4 w-full">
                    <div className="bg-black/40 p-3 rounded-xl border border-[#45A29E]/20">
                      <p className="text-gray-500 text-[10px] uppercase">Current Price</p>
                      <p className="text-[#66FCF1] font-mono text-xl font-bold">{item.price} SCAI</p>
                    </div>
                    
                    <button 
                      onClick={handleCancel}
                      disabled={loading}
                      className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="animate-spin" size={18} /> : <XCircle size={18} />}
                      {loading ? "Processing..." : "Delist Asset"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    <div className="relative group/input">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#45A29E]">
                        <DollarSign size={16} />
                      </div>
                      <input 
                        type="number" 
                        placeholder="New Price (SCAI)"
                        value={newPrice}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full bg-black/60 border border-[#45A29E]/40 rounded-xl py-4 pl-10 pr-4 text-white placeholder:text-gray-600 focus:border-[#66FCF1] outline-none transition-all"
                      />
                    </div>
                    
                    <button 
                      onClick={handleResell}
                      disabled={loading}
                      className="w-full py-4 bg-[#66FCF1] text-[#0B0C10] rounded-xl hover:bg-[#45A29E] transition-all flex items-center justify-center gap-2 font-black shadow-[0_0_20px_rgba(102,252,241,0.2)] disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="animate-spin" size={18} /> : <Tag size={18} />}
                      {loading ? "Listing..." : "LIST & SELL"}
                    </button>
                    <p className="text-[9px] text-gray-500 italic">
                      Listing fee: 0.025 SCAI applies
                    </p>
                  </div>
                )}

                <button 
                  onClick={() => setIsHovered(false)}
                  className="text-gray-500 hover:text-white text-[10px] uppercase tracking-widest flex items-center gap-1 mx-auto pt-2"
                >
                  <ChevronUp size={12} /> Hide Controls
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/20">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-[#66FCF1] transition-colors truncate">
            {item.name}
          </h3>
          <span className="text-[#45A29E] text-xs font-mono">#{item.tokenId}</span>
        </div>
        
        <p className="text-[#C5C6C7] text-sm line-clamp-2 mb-4">
          {item.description || "Secure NFT Asset"}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#45A29E]/10">
          <div>
            <p className="text-[10px] text-[#45A29E] uppercase tracking-wider mb-0.5">Valuation</p>
            <p className="text-lg font-bold text-[#66FCF1]">{item.price} <span className="text-xs">SCAI</span></p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#45A29E]/10 flex items-center justify-center border border-[#45A29E]/20">
             <Tag size={14} className="text-[#45A29E]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManagementNFTCard;
