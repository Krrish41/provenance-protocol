import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserProvider, JsonRpcProvider, Contract, formatEther } from 'ethers';
import axios from 'axios';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../utils/contract';
import NFTCard from '../components/ui/NFTCard';
import NFTModal from '../components/ui/NFTModal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ManagementNFTCard from '../components/ui/ManagementNFTCard';
import toast from 'react-hot-toast';
import { resolveIPFS } from '../utils/ipfs';
import { useAccount } from 'wagmi';
import { useWalletModal } from '../context/WalletModalContext';
import { ShieldAlert, LayoutGrid, ListFilter, User } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6"
      >
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 flex items-center gap-4 uppercase tracking-tighter">
            PROVENANCE <span className="text-[#66FCF1]">DASHBOARD</span>
          </h1>
          <p className="text-[#45A29E] font-mono text-sm tracking-widest">
            CONNECTED AS: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        <div className="bg-[#1e2024] px-6 py-3 rounded-2xl border border-[#45A29E]/30 backdrop-blur-sm">
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Total Assets</p>
          <p className="text-2xl font-bold text-[#66FCF1] font-mono">
            {ownedNfts.length + listedNfts.length} <span className="text-xs text-[#45A29E]">Items</span>
          </p>
        </div>
      </motion.div>

      <div className="space-y-24">
        {/* Active Listings Section */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <ListFilter className="text-emerald-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">Active Listings</h2>
              <p className="text-gray-500 text-sm italic">Items currently available for purchase on the open market.</p>
            </div>
            <div className="h-[1px] flex-grow bg-gradient-to-r from-emerald-500/30 to-transparent ml-4 hidden md:block"></div>
          </div>
          
          {loading ? (
            <SkeletonLoader />
          ) : listedNfts.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-[#45A29E]/10 rounded-3xl text-center bg-black/20">
              <p className="text-gray-500 font-medium">You don't have any items listed for sale.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {listedNfts.map((nft) => (
                <ManagementNFTCard 
                  key={nft.tokenId} 
                  item={nft} 
                  isListed={true} 
                  onRefresh={loadNFTs} 
                  onClick={(nft) => setSelectedNft(nft)} 
                />
              ))}
            </div>
          )}
        </section>

        {/* Personal Holdings Section */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-[#66FCF1]/10 rounded-xl flex items-center justify-center border border-[#66FCF1]/20">
              <LayoutGrid className="text-[#66FCF1]" size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">Personal Holdings</h2>
              <p className="text-gray-500 text-sm italic">Assets safely secured in your protocol wallet.</p>
            </div>
            <div className="h-[1px] flex-grow bg-gradient-to-r from-[#45A29E]/30 to-transparent ml-4 hidden md:block"></div>
          </div>
          
          {loading ? (
            <SkeletonLoader />
          ) : ownedNfts.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-[#45A29E]/10 rounded-3xl text-center bg-black/20">
              <p className="text-[#45A29E] font-medium mb-4">Your collection is currently empty.</p>
              <button 
                onClick={() => window.location.href = '/explore'}
                className="text-[#66FCF1] border border-[#66FCF1]/30 px-6 py-2 rounded-lg hover:bg-[#66FCF1]/10 transition-all text-sm uppercase font-bold tracking-widest"
              >
                Explore Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {ownedNfts.map((nft) => (
                <ManagementNFTCard 
                  key={nft.tokenId} 
                  item={nft} 
                  isListed={false} 
                  onRefresh={loadNFTs} 
                  onClick={(nft) => setSelectedNft(nft)} 
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedNft && (
        <NFTModal 
          nft={selectedNft} 
          isOpen={!!selectedNft} 
          onClose={() => setSelectedNft(null)} 
          onAction={() => {}} // Actions handled by hover overlay in dashboard
        />
      )}
    </div>
  );
};

export default Dashboard;
