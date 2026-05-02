import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import axios from 'axios';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../utils/contract';
import NFTCard from '../components/ui/NFTCard';
import NFTModal from '../components/ui/NFTModal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';
import { resolveIPFS } from '../utils/ipfs';
import { useAccount } from 'wagmi';
import { useWalletModal } from '../context/WalletModalContext';
import { ShieldAlert } from 'lucide-react';

const Dashboard = () => {
  const { isConnected, address } = useAccount();
  const { openWalletModal } = useWalletModal();
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [listedNfts, setListedNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNft, setSelectedNft] = useState(null);

  useEffect(() => {
    if (isConnected && address) {
      loadNFTs();
    }
  }, [isConnected, address]);

  async function loadNFTs() {
    try {
      if (!window.ethereum) {
          setLoading(false);
          return;
      }
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI, signer);
      
      const [ownedData, listedData] = await Promise.all([
        contract.fetchMyNFTs().catch(e => { console.error("fetchMyNFTs failed", e); return []; }),
        contract.fetchItemsListed().catch(e => { console.error("fetchItemsListed failed", e); return []; })
      ]);

      const processData = async (data) => {
        const items = await Promise.all(data.map(async i => {
          try {
            const tokenId = Number(i.tokenId);
            let tokenUri = "";
            try {
              tokenUri = await contract.tokenURI(i.tokenId);
            } catch (e) {
              console.warn("Could not fetch tokenURI for", tokenId);
            }

            let meta = { data: { name: `Network Asset #${tokenId}`, description: 'Metadata pending protocol verification.', image: '' } };
            
            if (tokenUri) {
              try {
                const url = resolveIPFS(tokenUri);
                const res = await axios.get(url, { timeout: 8000 });
                if (res.data) meta = res;
              } catch (e) {
                console.warn("Metadata timeout for", tokenId);
              }
            }

            return {
              price: formatEther(i.price.toString()),
              tokenId: tokenId,
              seller: i.seller.toLowerCase(),
              owner: i.owner.toLowerCase(),
              image: resolveIPFS(meta.data.image || meta.data.imageURL || ""),
              name: meta.data.name || `Network Asset #${tokenId}`,
              description: meta.data.description || 'Provenance synchronization in progress...',
            };
          } catch (err) {
            console.error("Error processing item", i.tokenId, err);
            return null; // Skip this item instead of crashing everything
          }
        }));
        return items.filter(item => item !== null);
      };

      const [owned, listed] = await Promise.all([
        processData(ownedData),
        processData(listedData)
      ]);

      setOwnedNfts(owned);
      setListedNfts(listed);
    } catch (error) {
      console.error("Critical error loading Dashboard:", error);
      toast.error("Failed to sync dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  function listNFT(nft) {
    toast.error("Reselling logic requires a contract update. Coming soon!");
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1e2024]/80 border border-[#45A29E]/30 backdrop-blur-md rounded-2xl p-10 max-w-xl w-full text-center shadow-[0_0_40px_rgba(69,162,158,0.1)]"
        >
          <div className="w-20 h-20 mx-auto bg-[#45A29E]/10 rounded-full flex items-center justify-center mb-8 border border-[#45A29E]/30">
            <ShieldAlert className="w-10 h-10 text-[#66FCF1]" />
          </div>
          
          <h2 className="text-3xl font-bold text-white uppercase tracking-tight mb-4 font-mono">
            Auth Required
          </h2>
          
          <p className="text-[#C5C6C7] mb-10 text-lg leading-relaxed">
            Please connect your wallet to access your personal Provenance Dashboard.
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={openWalletModal}
              type="button"
              className="provenance-btn px-10 py-4 text-lg shadow-[0_0_25px_rgba(102,252,241,0.2)]"
            >
              Connect Wallet
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8 space-y-12"
    >
      <section>
        <div className="flex justify-between items-center mb-10 border-b border-[#45A29E]/30 pb-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wide">Active Listings</h2>
          <span className="text-[#66FCF1] font-mono text-xs md:text-sm">{listedNfts.length} Assets on Market</span>
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
        <div className="flex justify-between items-center mb-10 border-b border-[#45A29E]/30 pb-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wide">Personal Holdings</h2>
          <span className="text-[#45A29E] font-mono text-xs md:text-sm">{ownedNfts.length} Assets Held</span>
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
