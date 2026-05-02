import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserProvider, JsonRpcProvider, Contract, formatEther, parseEther } from 'ethers';
import axios from 'axios';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../utils/contract';
import NFTCard from '../components/ui/NFTCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';

const Explore = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    try {
      let provider;
      if (window.ethereum) {
        provider = new BrowserProvider(window.ethereum);
      } else {
        const rpcUrl = import.meta.env.VITE_SCAI_RPC_URL || "https://34.rpc.thirdweb.com";
        provider = new JsonRpcProvider(rpcUrl);
      }

      const contract = new Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI, provider);
      const data = await contract.fetchMarketItems();

      // Retrieve cache with safety wrapper for restrictive incognito modes
      const cacheKey = 'provenance_market_metadata_v1';
      let cache = {};
      try {
        const savedCache = sessionStorage.getItem(cacheKey);
        if (savedCache) cache = JSON.parse(savedCache);
      } catch (e) {
        console.warn("sessionStorage access restricted in this environment.");
      }

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
          const tokenUri = await contract.tokenURI(i.tokenId);
          if (!tokenUri) return null;

          // Multi-gateway fallback strategy
          const gateways = [
            tokenUri.replace('gateway.pinata.cloud', 'cloudflare-ipfs.com'),
            tokenUri, // Original (Pinata)
            tokenUri.replace('gateway.pinata.cloud', 'ipfs.io')
          ];
          
          let meta = null;
          for (const url of gateways) {
            try {
              const res = await axios.get(url, { timeout: 3000 });
              if (res.data) {
                meta = res.data;
                break; 
              }
            } catch (e) {
              continue; // Try next gateway
            }
          }

          if (!meta) {
            console.warn(`Metadata pending for token ${tokenId}`);
            return {
              tokenId,
              image: '', 
              name: `Asset #${tokenId} // Processing`,
              description: "The protocol is currently synchronizing this asset's metadata across the IPFS network. High-resolution media will be available shortly.",
              price: formatEther(i.price.toString()),
              seller: i.seller.toLowerCase(),
              owner: i.owner.toLowerCase(),
              isPending: true
            };
          }
          
          const itemData = {
            tokenId,
            image: meta.image ? meta.image.replace('gateway.pinata.cloud', 'cloudflare-ipfs.com') : '',
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
          console.error(`Error processing token ${tokenId}:`, e);
          return null;
        }
      }));

      setNfts(items.filter(item => item !== null));
      setLoading(false);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      toast.error("Failed to fetch marketplace data.");
      setLoading(false);
    }
  }

  async function buyNft(nft) {
    try {
      if (!window.ethereum) return toast.error("Please install MetaMask to purchase assets!");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const userAddress = (await signer.getAddress()).toLowerCase();
      if (nft.seller === userAddress) {
        return toast.error("You cannot buy this asset. It is already owned or listed by you.");
      }

      const contract = new Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI, signer);
      const price = parseEther(nft.price.toString());
      
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price
      });
      
      const loadingToast = toast.loading("Confirming transaction on SCAI Mainnet...");
      await transaction.wait();
      toast.dismiss(loadingToast);
      toast.success("Provenance ownership verified. Asset transferred.");
      loadNFTs();
    } catch (error) {
      console.error("Error buying NFT:", error);
      toast.error("Transaction failed. Verify SCAI balance and gas.");
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
        <h2 className="text-3xl font-bold text-white">Explore Market</h2>
        <span className="text-[#45A29E] font-mono text-sm">{nfts.length} Assets Found</span>
      </div>
      
      {loading ? (
        <SkeletonLoader />
      ) : nfts.length === 0 ? (
        <div className="text-center py-20 text-[#C5C6C7] bg-[#1e2024]/30 rounded-xl border border-[#45A29E]/10">
          <p className="text-xl">No items in marketplace</p>
          <p className="text-sm mt-2">Check back later or mint your own!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {nfts.map((nft, i) => (
            <NFTCard 
              key={i} 
              item={nft} 
              onAction={buyNft} 
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Explore;

