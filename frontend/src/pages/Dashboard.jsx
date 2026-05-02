import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import axios from 'axios';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../utils/contract';
import NFTCard from '../components/ui/NFTCard';
import NFTModal from '../components/ui/NFTModal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';
import { getIPFSUrl } from '../utils/ipfs';

const Dashboard = () => {
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [listedNfts, setListedNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNft, setSelectedNft] = useState(null);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    try {
      if (!window.ethereum) {
          setLoading(false);
          return;
      }
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI, signer);
      
      const [ownedData, listedData] = await Promise.all([
        contract.fetchMyNFTs(),
        contract.fetchItemsListed()
      ]);

      const processData = async (data) => {
        return await Promise.all(data.map(async i => {
          const tokenUri = await contract.tokenURI(i.tokenId);
          let meta = { data: { name: `Asset #${i.tokenId}`, description: '', image: '' } };
          try {
            const url = getIPFSUrl(tokenUri);
            meta = await axios.get(url, { timeout: 5000 });
          } catch (e) {
            console.warn("Metadata pending for", i.tokenId);
          }
          return {
            price: formatEther(i.price.toString()),
            tokenId: Number(i.tokenId),
            seller: i.seller.toLowerCase(),
            owner: i.owner.toLowerCase(),
            image: getIPFSUrl(meta.data.image),
            name: meta.data.name || `Asset #${i.tokenId}`,
            description: meta.data.description,
          };
        }));
      };

      const [owned, listed] = await Promise.all([
        processData(ownedData),
        processData(listedData)
      ]);

      setOwnedNfts(owned);
      setListedNfts(listed);
      setLoading(false);
    } catch (error) {
      console.error("Error loading Dashboard NFTs:", error);
      setLoading(false);
    }
  }

  function listNFT(nft) {
    toast.error("Reselling logic requires a contract update. Coming soon!");
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8 space-y-12"
    >
      <section>
        <div className="flex justify-between items-center mb-8 border-b border-[#45A29E]/30 pb-4">
          <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Active Listings</h2>
          <span className="text-[#66FCF1] font-mono text-sm">{listedNfts.length} Assets on Market</span>
        </div>
        
        {loading ? (
          <SkeletonLoader />
        ) : listedNfts.length === 0 ? (
          <div className="text-center py-10 text-[#C5C6C7]/50 bg-[#1e2024]/10 rounded-xl border border-[#45A29E]/5 dashed">
            <p className="text-lg">No assets currently listed for sale.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {listedNfts.map((nft, i) => (
              <NFTCard key={i} item={nft} onAction={listNFT} onClick={(nft) => setSelectedNft(nft)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-8 border-b border-[#45A29E]/30 pb-4">
          <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Personal Holdings</h2>
          <span className="text-[#45A29E] font-mono text-sm">{ownedNfts.length} Assets Held</span>
        </div>
        
        {loading ? (
          <SkeletonLoader />
        ) : ownedNfts.length === 0 ? (
          <div className="text-center py-20 text-[#C5C6C7] bg-[#1e2024]/30 rounded-xl border border-[#45A29E]/10">
            <p className="text-xl">Your collection is empty.</p>
            <p className="text-sm mt-2">Acquire assets from the Explore page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {ownedNfts.map((nft, i) => (
              <NFTCard key={i} item={nft} onAction={listNFT} onClick={(nft) => setSelectedNft(nft)} />
            ))}
          </div>
        )}
      </section>

      {selectedNft && (
        <NFTModal 
          nft={selectedNft} 
          isOpen={!!selectedNft} 
          onClose={() => setSelectedNft(null)} 
          onAction={listNFT}
        />
      )}
    </motion.div>
  );
};

export default Dashboard;

