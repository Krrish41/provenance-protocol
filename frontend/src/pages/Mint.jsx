import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseEther, formatEther } from 'viem';
import { UploadCloud, Loader2, ShieldAlert, ExternalLink, CheckCircle2, ChevronRight, LayoutDashboard } from 'lucide-react';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../utils/contract';
import { uploadFileToIPFS, uploadJSONToIPFS, unpinFromIPFS } from '../utils/pinata';
import toast from 'react-hot-toast';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useSwitchChain } from 'wagmi';
import { useWalletModal } from '../context/WalletModalContext';
import { Link } from 'react-router-dom';

const Mint = () => {
  const { isConnected, address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openWalletModal } = useWalletModal();
  const publicClient = usePublicClient({ chainId: 34 });
  
  const [formInput, setFormInput] = useState({ price: '', name: '', description: '' });
  const [fileUrl, setFileUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [isIpfsUploading, setIsIpfsUploading] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const { writeContractAsync, isPending: isWritePending, isError: isWriteError, error: writeError } = useWriteContract();

  const { 
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Derived States
  const isWorking = isIpfsUploading || isWritePending || isConfirming;
  const showSuccess = isConfirmed && !!txHash;

  async function onChange(e) {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setFileUrl(URL.createObjectURL(file));
    }
  }

  const getButtonText = () => {
    if (isIpfsUploading) return "Uploading to IPFS...";
    if (isWritePending) return "Confirm in Wallet...";
    if (isConfirming) return "Inscribing on Chain...";
    if (chainId !== 34 && isConnected) return "Switch to SecureChain";
    return "MINT & LIST ASSET";
  };

  async function createMarketItem() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !file) {
      return toast.error("Please fill all fields!");
    }
    
    if (chainId !== 34) {
      try {
        await switchChainAsync({ chainId: 34 });
        return;
      } catch (e) {
        return toast.error("Please switch to SecureChain Mainnet");
      }
    }

    let uploadedImageURL = null;
    let uploadedTokenURI = null;

    try {
      // 1. IPFS Phase
      setIsIpfsUploading(true);
      uploadedImageURL = await uploadFileToIPFS(file);
      const metadata = { name, description, image: uploadedImageURL };
      uploadedTokenURI = await uploadJSONToIPFS(metadata);
      setIsIpfsUploading(false);

      // 2. Blockchain Phase
      const priceInWei = parseEther(formInput.price);
      const listingPrice = await publicClient.readContract({
        address: MARKETPLACE_ADDRESS,
        abi: NFTMarketplaceABI,
        functionName: 'getListingPrice',
      });

      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: NFTMarketplaceABI,
        functionName: 'createToken',
        args: [uploadedTokenURI, priceInWei],
        value: listingPrice,
        chainId: 34,
        type: 'legacy',
      });
      
      if (hash) {
        setTxHash(hash);
        toast.success("Transaction submitted to SecureChain!");
      }

    } catch (error) {
      console.error("Minting lifecycle error:", error);
      setIsIpfsUploading(false);
      
      // Cleanup IPFS if wallet phase fails
      if (uploadedImageURL || uploadedTokenURI) {
        await Promise.all([
          uploadedImageURL && unpinFromIPFS(uploadedImageURL),
          uploadedTokenURI && unpinFromIPFS(uploadedTokenURI)
        ].filter(Boolean));
      }

      toast.error(error.shortMessage || error.message || "Minting failed");
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
          <h2 className="text-3xl font-bold text-white uppercase tracking-tight mb-4 font-mono">Auth Required</h2>
          <p className="text-[#C5C6C7] mb-10 text-lg leading-relaxed">Please connect your wallet to access the Provenance Minting Terminal.</p>
          <div className="flex justify-center">
            <button onClick={openWalletModal} type="button" className="provenance-btn px-10 py-4 text-lg">Connect Wallet</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-2xl mx-auto px-4">
      <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wide mb-10 border-b border-[#45A29E]/30 pb-4">
        {showSuccess ? "Asset Verified" : "Mint New Asset"}
      </h2>
      
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1e2024]/80 border border-emerald-500/30 rounded-2xl p-8 backdrop-blur-md text-center space-y-8"
          >
            <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white uppercase">Protocol Inscription Complete</h3>
              <p className="text-gray-400">Your asset has been successfully hardcoded into the SecureChain ledger.</p>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-emerald-500/10 flex flex-col gap-3">
               <div className="flex items-center justify-between text-xs">
                 <span className="text-gray-500 uppercase font-bold">Transaction Hash</span>
                 <a 
                  href={`https://explorer.securechain.ai/tx/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 flex items-center gap-1 hover:underline"
                 >
                   View on Explorer <ExternalLink size={12} />
                 </a>
               </div>
               <code className="text-[10px] text-gray-400 break-all bg-black/20 p-2 rounded border border-white/5">{txHash}</code>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/dashboard" 
                className="flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-all"
              >
                <LayoutDashboard size={18} /> View in Dashboard
              </Link>
              <button 
                onClick={() => {
                  setTxHash(null);
                  setFormInput({ price: '', name: '', description: '' });
                  setFile(null);
                  setFileUrl(null);
                }}
                className="flex-1 bg-white/5 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/10"
              >
                Mint Another <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-[#1e2024]/50 border border-[#45A29E]/30 rounded-xl p-8 backdrop-blur-sm shadow-2xl space-y-6"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-[#C5C6C7] mb-2 font-semibold uppercase text-xs tracking-widest">Asset Name</label>
                <input 
                  disabled={isWorking}
                  placeholder="e.g. Genesis Protocol Core"
                  className="w-full bg-[#0B0C10] border border-[#45A29E]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#66FCF1] transition-colors disabled:opacity-50"
                  onChange={e => setFormInput({ ...formInput, name: e.target.value })}
                  value={formInput.name}
                />
              </div>

              <div>
                <label className="block text-[#C5C6C7] mb-2 font-semibold uppercase text-xs tracking-widest">Description</label>
                <textarea
                  disabled={isWorking}
                  placeholder="Describe the authenticity and provenance of this asset..."
                  className="w-full bg-[#0B0C10] border border-[#45A29E]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#66FCF1] transition-colors h-32 resize-none disabled:opacity-50"
                  onChange={e => setFormInput({ ...formInput, description: e.target.value })}
                  value={formInput.description}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#C5C6C7] mb-2 font-semibold uppercase text-xs tracking-widest">Price (SCAI)</label>
                  <input
                    disabled={isWorking}
                    type="number"
                    placeholder="0.05"
                    className="w-full bg-[#0B0C10] border border-[#45A29E]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#66FCF1] transition-colors disabled:opacity-50"
                    onChange={e => setFormInput({ ...formInput, price: e.target.value })}
                    value={formInput.price}
                  />
                </div>
                <div>
                  <label className="block text-[#C5C6C7] mb-2 font-semibold uppercase text-xs tracking-widest">Media Integrity</label>
                  <label className={`flex items-center justify-center w-full h-[52px] border-2 border-[#45A29E]/50 border-dashed rounded-lg cursor-pointer bg-[#0B0C10]/50 hover:border-[#66FCF1] transition-all relative overflow-hidden ${isWorking ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <span className="text-xs text-gray-400 font-bold uppercase truncate px-4">
                      {file ? `Attached: ${file.name}` : "Select Digital Core"}
                    </span>
                    <input disabled={isWorking} type="file" className="hidden" onChange={onChange} />
                  </label>
                </div>
              </div>

              {fileUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#45A29E]/20">
                  <img src={fileUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}

              <div className="space-y-4">
                <button 
                  onClick={createMarketItem}
                  disabled={isWorking}
                  className={`provenance-btn w-full !py-5 flex items-center justify-center gap-3 relative overflow-hidden group ${isWorking ? 'grayscale pointer-events-none' : ''}`}
                >
                  {isWorking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="uppercase font-black tracking-tighter">{getButtonText()}</span>
                    </>
                  ) : (
                    <span className="uppercase font-black tracking-widest">{getButtonText()}</span>
                  )}
                  {isWorking && (
                    <motion.div 
                      className="absolute bottom-0 left-0 h-1 bg-[#66FCF1]"
                      initial={{ width: "0%" }}
                      animate={{ width: isIpfsUploading ? "40%" : isWritePending ? "70%" : "95%" }}
                    />
                  )}
                </button>

                {/* Granular Feedback Alerts */}
                <AnimatePresence>
                  {isWorking && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {isIpfsUploading && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs flex items-center gap-3">
                          <UploadCloud size={16} className="animate-bounce" />
                          <span>SYNCHRONIZING MEDIA TO IPFS GATEWAY...</span>
                        </div>
                      )}
                      {isWritePending && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-xs flex items-center gap-3">
                          <ShieldAlert size={16} className="animate-pulse" />
                          <span>AWAITING WALLET SIGNATURE. PLEASE CONFIRM TRANSACTION.</span>
                        </div>
                      )}
                      {isConfirming && (
                        <div className="p-4 bg-[#66FCF1]/10 border border-[#66FCF1]/20 rounded-xl text-[#66FCF1] text-xs space-y-2">
                          <div className="flex items-center gap-3">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="font-bold">INSCRIBING ON BLOCKCHAIN...</span>
                          </div>
                          <a 
                            href={`https://explorer.securechain.ai/tx/${txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity underline pl-7"
                          >
                            Live Network Monitor <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Mint;
