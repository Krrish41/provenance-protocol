import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrowserProvider, JsonRpcProvider, Contract, formatEther, parseEther } from 'ethers';
import axios from 'axios';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../utils/contract';
import NFTCard from '../components/ui/NFTCard';
import NFTModal from '../components/ui/NFTModal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';
import { resolveIPFS, getAllIPFSGateways } from '../utils/ipfs';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Instantiate provider and contract outside the component lifecycle for immediate readiness
const rpcUrl = import.meta.env.VITE_SCAI_RPC_URL || "https://34.rpc.thirdweb.com";
const rpcProvider = new JsonRpcProvider(rpcUrl);
const marketplaceContract = new Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI, rpcProvider);

const Explore = () => {
  const [selectedNft, setSelectedNft] = useState(null);
  const queryClient = useQueryClient();

  const { data: nfts = [], isLoading: loading } = useQuery({
    queryKey: ['marketItems'],
    queryFn: async () => {
      const data = await marketplaceContract.fetchMarketItems();

      const cacheKey = 'provenance_market_metadata_v5';
      let cache = {};
      try {
        const savedCache = sessionStorage.getItem(cacheKey);
        if (savedCache) cache = JSON.parse(savedCache);
      } catch (e) {}

      const items = await Promise.all(data.map(async i => {
        const tokenId = Number(i.tokenId);
        
        if (cache[tokenId]) {
          return {
            ...cache[tokenId],
            seller: i.seller.toLowerCase(),
            owner: i.owner.toLowerCase(),
            price: formatEther(i.price.toString())
          };
        }

        try {
          const tokenUri = await marketplaceContract.tokenURI(i.tokenId);
          if (!tokenUri) return null;

          const gateways = getAllIPFSGateways(tokenUri);
          
          let meta = null;
          try {
            const url = resolveIPFS(tokenUri);
            const res = await axios.get(url, { timeout: 10000 });
            if (res.data && (res.data.image || res.data.name)) {
              meta = res.data;
            }
          } catch (e) {
            console.warn("Metadata sync failed for", tokenId);
          }

          if (!meta) {
            return {
              tokenId,
              image: '', 
              name: `Asset #${tokenId}`,
              description: "Metadata synchronization failed. Protocol verification pending.",
              price: formatEther(i.price.toString()),
              seller: i.seller.toLowerCase(),
              owner: i.owner.toLowerCase(),
              isFailed: true
            };
          }
          
          const itemData = {
            tokenId,
            image: resolveIPFS(meta.image || meta.imageURL || ""),
            name: meta.name || `Asset #${tokenId}`,
            description: meta.description || "No description provided.",
          };

          try {
            cache[tokenId] = itemData;
            sessionStorage.setItem(cacheKey, JSON.stringify(cache));
          } catch (e) {}

          return {
            ...itemData,
            price: formatEther(i.price.toString()),
            seller: i.seller.toLowerCase(),
            owner: i.owner.toLowerCase(),
          };
        } catch (e) {
          return null;
        }
      }));

      return items.filter(item => item !== null);
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  async function buyNft(nft) {
    try {
      if (!window.ethereum) return toast.error("Please install MetaMask!");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = (await signer.getAddress()).toLowerCase();
      
      if (nft.seller === userAddress) {
        return toast.error("You cannot buy this asset. It is already owned or listed by you.");
      }

      const contract = new Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI, signer);
      const price = parseEther(nft.price.toString());
      const transaction = await contract.createMarketSale(nft.tokenId, { value: price });
      
      const loadingToast = toast.loading("Confirming transaction...");
      await transaction.wait();
      toast.dismiss(loadingToast);
      toast.success("Purchase successful!");
      queryClient.invalidateQueries({ queryKey: ['marketItems'] });
      if (selectedNft) setSelectedNft(null);
    } catch (error) {
      console.error("Error buying NFT:", error);
      toast.error("Transaction failed or rejected.");
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8"
    >
      <div className="flex justify-between items-center mb-8 border-b border-[#45A29E]/30 pb-4">
        <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">Explore Market</h2>
        <span className="text-[#45A29E] font-mono text-sm">{nfts.length} Assets Found</span>
      </div>
      
      {loading ? (
        <SkeletonLoader />
      ) : nfts.length === 0 ? (
        <div className="text-center py-20 text-[#C5C6C7] bg-[#1e2024]/30 rounded-xl border border-[#45A29E]/10">
          <p className="text-xl">No items in marketplace</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {nfts.map((nft, i) => (
            <NFTCard 
              key={i} 
              item={nft} 
              onAction={buyNft} 
              onClick={(nft) => setSelectedNft(nft)}
            />
          ))}
        </div>
      )}

      {selectedNft && (
        <NFTModal 
          nft={selectedNft} 
          isOpen={!!selectedNft} 
          onClose={() => setSelectedNft(null)} 
          onAction={buyNft}
        />
      )}
    </motion.div>
  );
};

export default Explore;
