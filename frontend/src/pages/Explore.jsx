import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers';
import axios from 'axios';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../utils/contract';
import NFTCard from '../components/ui/NFTCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const Explore = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    try {
      if (!window.ethereum) {
          console.warn("Please install MetaMask");
          setLoading(false);
          return;
      }
      // Using a generic provider to read the blockchain state
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI, provider);
      const data = await contract.fetchMarketItems();

      const items = await Promise.all(data.map(async i => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = formatEther(i.price.toString());
        return {
          price,
          tokenId: Number(i.tokenId),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
      }));

      setNfts(items);
      setLoading(false);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setLoading(false);
    }
  }

  async function buyNft(nft) {
    try {
      if (!window.ethereum) return alert("Please install MetaMask!");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI, signer);

      const price = parseEther(nft.price.toString());
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price
      });
      
      alert("Transaction submitted! Waiting for confirmation...");
      await transaction.wait();
      alert("Successfully purchased NFT!");
      loadNFTs();
    } catch (error) {
      console.error("Error buying NFT:", error);
      alert("Error purchasing NFT. See console.");
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
            <NFTCard key={i} item={nft} isOwner={false} onAction={buyNft} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Explore;
