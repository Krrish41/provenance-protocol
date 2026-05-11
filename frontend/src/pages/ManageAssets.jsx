import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { JsonRpcProvider, Contract, formatEther } from 'ethers';
import axios from 'axios';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../utils/contract';
import ManageAssetCard from '../components/ui/ManageAssetCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import toast from 'react-hot-toast';
import { resolveIPFS } from '../utils/ipfs';
import { useAccount } from 'wagmi';
import { useWalletModal } from '../context/WalletModalContext';
import { ShieldAlert, Settings2, LayoutGrid, ListFilter } from 'lucide-react';

const ManageAssets = () => {
  const { isConnected, address } = useAccount();
  const { openWalletModal } = useWalletModal();
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [listedNfts, setListedNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'owned', 'listed'

  useEffect(() => {
    if (isConnected && address) {
      loadNFTs();
    }
  }, [isConnected, address]);

  async function loadNFTs() {
    try {
      setLoading(true);
      const rpcUrl = import.meta.env.VITE_SCAI_RPC_URL || "https://34.rpc.thirdweb.com";
      const rpcProvider = new JsonRpcProvider(rpcUrl);
      const rpcContract = new Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI, rpcProvider);
      
      const userAddr = address.toLowerCase();

      const [rawOwned, rawMarket] = await Promise.all([
        rpcContract.fetchMyNFTs({ from: address }).catch(() => []),
        rpcContract.fetchMarketItems().catch(() => [])
      ]);

      const processItem = async (i) => {
        try {
          if (!i || !i.tokenId) return null;
          const tokenId = Number(i.tokenId);
          const seller = i.seller ? i.seller.toLowerCase() : "";
          const owner = i.owner ? i.owner.toLowerCase() : "";
          
          let tokenUri = await rpcContract.tokenURI(i.tokenId).catch(() => "");
          let meta = { data: { name: `Asset #${tokenId}`, description: '', image: '' } };
          
          if (tokenUri) {
            try {
              const url = resolveIPFS(tokenUri);
              const res = await axios.get(url, { timeout: 5000 });
              if (res.data) meta = res;
            } catch (e) {
              console.warn("Metadata error for", tokenId);
            }
          }

          return {
            price: i.price.toString(),
            tokenId: tokenId,
            seller: seller,
            owner: owner,
            sold: i.sold,
            image: resolveIPFS(meta.data.image || meta.data.imageURL || ""),
            name: meta.data.name || `Asset #${tokenId}`,
            description: meta.data.description || '',
          };
        } catch (err) {
          return null;
        }
      };

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

      // Filter listed items where user is the seller
      const listed = processedMarket.filter(item => item.seller === userAddr && !item.sold);
      
      // Filter owned items (in wallet) - this includes both fetchMyNFTs and address(this) fallback
      const inWallet = processedOwned.filter(item => item.owner === userAddr);

      setOwnedNfts(inWallet);
      setListedNfts(listed);
    } catch (error) {
      toast.error("Failed to load assets.");
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[60vh]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <ShieldAlert className="w-16 h-16 text-[#66FCF1] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Management Terminal Locked</h2>
          <p className="text-gray-400 mb-8">Connect your wallet to manage your listed and owned assets.</p>
          <button onClick={openWalletModal} className="provenance-btn px-8 py-3">Connect Wallet</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 flex items-center gap-4">
            MANAGE <span className="text-[#66FCF1]">ASSETS</span>
            <Settings2 className="text-[#45A29E]" size={32} />
          </h1>
          <p className="text-gray-400">Control your listings and update marketplace presence.</p>
        </div>

        <div className="flex bg-[#1e2024] p-1 rounded-xl border border-[#45A29E]/20">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-[#66FCF1] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('listed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'listed' ? 'bg-[#66FCF1] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Listed
          </button>
          <button 
            onClick={() => setFilter('owned')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'owned' ? 'bg-[#66FCF1] text-black' : 'text-gray-400 hover:text-white'}`}
          >
            In Wallet
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="space-y-16">
          {(filter === 'all' || filter === 'listed') && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <ListFilter className="text-[#66FCF1]" size={24} />
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Active Market Listings</h2>
                <div className="h-[1px] flex-grow bg-gradient-to-r from-[#45A29E]/30 to-transparent ml-4"></div>
              </div>
              
              {listedNfts.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-[#45A29E]/10 rounded-3xl text-center">
                  <p className="text-gray-500">No assets currently listed on the market.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {listedNfts.map((nft) => (
                    <ManageAssetCard key={nft.tokenId} nft={nft} isListed={true} onRefresh={loadNFTs} />
                  ))}
                </div>
              )}
            </section>
          )}

          {(filter === 'all' || filter === 'owned') && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <LayoutGrid className="text-[#45A29E]" size={24} />
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Idle Personal Holdings</h2>
                <div className="h-[1px] flex-grow bg-gradient-to-r from-[#45A29E]/30 to-transparent ml-4"></div>
              </div>
              
              {ownedNfts.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-[#45A29E]/10 rounded-3xl text-center">
                  <p className="text-gray-500">No idle assets in your wallet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {ownedNfts.map((nft) => (
                    <ManageAssetCard key={nft.tokenId} nft={nft} isListed={false} onRefresh={loadNFTs} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageAssets;
