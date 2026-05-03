import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserProvider, JsonRpcProvider, Contract, formatEther } from 'ethers';
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
  const { isConnected, address, chain } = useAccount();
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
      setLoading(true);
      
      // Use the same stable RPC as Explore.jsx for reliable data fetching
      const rpcUrl = import.meta.env.VITE_SCAI_RPC_URL || "https://34.rpc.thirdweb.com";
      const rpcProvider = new JsonRpcProvider(rpcUrl);
      const rpcContract = new Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI, rpcProvider);
      
      console.log("Connected Chain:", chain?.id);
      console.log("Target Contract:", MARKETPLACE_ADDRESS);
      console.log("Connected Address:", address);

      // Fetch data using both specialized methods and global market list for redundancy
      const [rawOwned, rawMarket] = await Promise.all([
        rpcContract.fetchMyNFTs({ from: address }).catch(e => { 
          console.warn("Specialized fetchMyNFTs failed, will fallback to manual filter", e); 
          return []; 
        }),
        rpcContract.fetchMarketItems().catch(e => { 
          console.error("fetchMarketItems failed", e); 
          return []; 
        })
      ]);

      console.log("RAW DATA RECEIVED:", { 
        ownedCount: rawOwned?.length || 0, 
        marketCount: rawMarket?.length || 0 
      });

      const userAddr = address.toLowerCase();

      const processItem = async (i) => {
        try {
          if (!i || !i.tokenId) return null;
          const tokenId = Number(i.tokenId);
          const seller = i.seller ? i.seller.toLowerCase() : "";
          const owner = i.owner ? i.owner.toLowerCase() : "";
          
          let tokenUri = "";
          try {
            tokenUri = await rpcContract.tokenURI(i.tokenId);
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
            seller: seller,
            owner: owner,
            sold: i.sold,
            image: resolveIPFS(meta.data.image || meta.data.imageURL || ""),
            name: meta.data.name || `Network Asset #${tokenId}`,
            description: meta.data.description || 'Provenance synchronization in progress...',
          };
        } catch (err) {
          console.error("Error processing item", i?.tokenId, err);
          return null;
        }
      };

      // Process all data with allSettled for maximum isolation
      const [ownedResults, marketResults] = await Promise.all([
        Promise.allSettled(rawOwned.map(i => processItem(i))),
        Promise.allSettled(rawMarket.map(i => processItem(i)))
      ]);

      const processedOwned = ownedResults
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);
        
      const processedMarket = marketResults
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);

      // REDUNDANCY CHECK: If specialized owned fetch failed, we find user's items in the market list
      // This ensures that even if msg.sender logic fails at the RPC level, we still see our items
      const manuallyFilteredOwned = processedMarket.filter(item => item.owner === userAddr);
      
      // Final list of owned NFTs (merging both sources and removing duplicates)
      const combinedOwned = [...processedOwned];
      manuallyFilteredOwned.forEach(m => {
        if (!combinedOwned.find(o => o.tokenId === m.tokenId)) {
          combinedOwned.push(m);
        }
      });

      // 2. Active Listings: Items from marketData where user is the seller
      const listed = processedMarket.filter(item => {
        const isUserSeller = item.seller === userAddr;
        return isUserSeller && !item.sold;
      });

      console.log("Final Dashboard State:", { 
        holdings: combinedOwned.length, 
        listings: listed.length 
      });

      setOwnedNfts(combinedOwned);
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
