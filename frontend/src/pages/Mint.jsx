import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { parseEther, formatEther, parseGwei } from 'viem';
import { UploadCloud, Loader2, ShieldAlert, ExternalLink, AlertTriangle } from 'lucide-react';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../utils/contract';
import { uploadFileToIPFS, uploadJSONToIPFS, unpinFromIPFS } from '../utils/pinata';
import toast from 'react-hot-toast';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useWalletClient, useChainId, useSwitchChain } from 'wagmi';
import { useWalletModal } from '../context/WalletModalContext';

const Mint = () => {
  const { isConnected, address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { openWalletModal } = useWalletModal();
  const publicClient = usePublicClient({ chainId: 34 });
  const { data: walletClient } = useWalletClient();
  
  const [formInput, setFormInput] = useState({ price: '', name: '', description: '' });
  const [fileUrl, setFileUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState(null);

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const { 
    data: receipt, 
    isLoading: isWaitingForReceipt,
    isSuccess: isTxSuccess,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
      retry: 10,
      retryDelay: 3000,
    }
  });

  useEffect(() => {
    if (isTxSuccess) {
      toast.success('Successfully minted and listed!');
      setStatus('Successfully minted and listed!');
      setFormInput({ price: '', name: '', description: '' });
      setFile(null);
      setFileUrl(null);
      setTxHash(null);
      setTimeout(() => setStatus(''), 5000);
    }
  }, [isTxSuccess]);

  useEffect(() => {
    if (receiptError) {
      console.error("Receipt error:", receiptError);
      setStatus(`Transaction error: ${receiptError.message}`);
      toast.error("Transaction might have been dropped. Please check explorer.");
    }
  }, [receiptError]);

  async function onChange(e) {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setFileUrl(URL.createObjectURL(file));
    }
  }

  async function createMarketItem() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !file) {
      return toast.error("Please fill all fields!");
    }
    
    setUploading(true);
    setStatus('Initializing Pre-Flight Protocol...');
    
    let uploadedImageURL = null;
    let uploadedTokenURI = null;

    try {
      // 1. Strict Network Guard
      if (!isConnected || !address) throw new Error("Please connect your wallet first.");
      if (chainId !== 34) {
        setStatus('Switching to SecureChain AI Mainnet...');
        await switchChainAsync({ chainId: 34 });
        throw new Error("Network switched. Please initiate minting again.");
      }

      // 2. Pre-Flight Balance & Cost Check
      setStatus('Verifying Fuel Reserves (SCAI)...');
      const [balance, listingPrice] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.readContract({
          address: MARKETPLACE_ADDRESS,
          abi: NFTMarketplaceABI,
          functionName: 'getListingPrice',
        })
      ]);

      const priceInWei = parseEther(formInput.price);
      
      if (balance < listingPrice) {
        throw new Error(`Insufficient balance for fees. Required: ~${formatEther(listingPrice)} SCAI`);
      }

      // 3. Dry-Run Simulation
      setStatus('Executing Transaction Dry-Run...');
      const dummyURI = "ipfs://pre-flight-check-signature";
      
      try {
        await publicClient.simulateContract({
          address: MARKETPLACE_ADDRESS,
          abi: NFTMarketplaceABI,
          functionName: 'createToken',
          args: [dummyURI, priceInWei],
          value: listingPrice,
          account: address,
        });
      } catch (simError) {
        throw new Error(`Execution dry-run failed: ${simError.shortMessage || "Contract revert detected."}`);
      }

      // 4. IPFS Upload (Gatekeeper Passed)
      setStatus('Gatekeeper Passed. Synchronizing Media to IPFS...');
      uploadedImageURL = await uploadFileToIPFS(file);
      const metadata = { name, description, image: uploadedImageURL };
      uploadedTokenURI = await uploadJSONToIPFS(metadata);

      try {
        const hash = await walletClient.writeContract({
          address: MARKETPLACE_ADDRESS,
          abi: NFTMarketplaceABI,
          functionName: 'createToken',
          args: [uploadedTokenURI, priceInWei],
          value: listingPrice,
          account: address,
          chainId: 34,
        });
        setTxHash(hash);
      } catch (writeError) {
        // CLEANUP: If user rejects, remove orphan data from Pinata
        if (writeError.name === 'UserRejectedRequestError' || writeError.message?.toLowerCase().includes('rejected')) {
          setStatus('Cleanup: Request denied. Removing orphan IPFS data...');
          await Promise.all([
            unpinFromIPFS(uploadedImageURL),
            unpinFromIPFS(uploadedTokenURI)
          ]);
        }
        throw writeError;
      }

      const explorerUrl = `https://explorer.securechain.ai/tx/${hash}`;
      setStatus(
        <div className="w-full space-y-3">
          <div className="flex items-center gap-3 text-[#66FCF1]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-bold tracking-tight">INSCRIBING ON BLOCKCHAIN...</span>
          </div>
          <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-[#66FCF1]/10">
            <span className="text-gray-400 text-xs">Transaction Pulse Detected</span>
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 text-[#66FCF1] hover:text-[#45A29E] transition-colors text-xs font-black uppercase tracking-tighter"
            >
              Live Monitor <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      );

    } catch (error) {
      console.error("Minting lifecycle error:", error);
      let errorMessage = error.shortMessage || error.message || 'Workflow execution failed';

      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction signature denied by user.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient SCAI balance for this operation.';
      }

      toast.error(errorMessage);
      setStatus(
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Error: {errorMessage}</span>
        </div>
      );
    } finally {
      setUploading(false);
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
            Please connect your wallet to access the Provenance Minting Terminal.
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="py-8 max-w-2xl mx-auto"
    >
      <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wide mb-10 border-b border-[#45A29E]/30 pb-4">Mint New Asset</h2>
      
      <div className="bg-[#1e2024]/50 border border-[#45A29E]/30 rounded-xl p-8 backdrop-blur-sm shadow-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-[#C5C6C7] mb-2 font-semibold">Asset Name</label>
            <input 
              placeholder="e.g. Genesis Protocol Core"
              className="w-full bg-[#0B0C10] border border-[#45A29E]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#66FCF1] transition-colors"
              onChange={e => setFormInput({ ...formInput, name: e.target.value })}
              value={formInput.name}
            />
          </div>

          <div>
            <label className="block text-[#C5C6C7] mb-2 font-semibold">Description</label>
            <textarea
              placeholder="Describe the authenticity and provenance of this asset..."
              className="w-full bg-[#0B0C10] border border-[#45A29E]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#66FCF1] transition-colors h-32 resize-none"
              onChange={e => setFormInput({ ...formInput, description: e.target.value })}
              value={formInput.description}
            />
          </div>

          <div>
            <label className="block text-[#C5C6C7] mb-2 font-semibold">Price (SCAI)</label>
            <input
              type="number"
              placeholder="0.05"
              className="w-full bg-[#0B0C10] border border-[#45A29E]/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#66FCF1] transition-colors"
              onChange={e => setFormInput({ ...formInput, price: e.target.value })}
              value={formInput.price}
            />
          </div>

          <div>
            <label className="block text-[#C5C6C7] mb-2 font-semibold">Media File</label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#45A29E]/50 border-dashed rounded-lg cursor-pointer bg-[#0B0C10]/50 hover:bg-[#0B0C10] hover:border-[#66FCF1] transition-all interactive relative overflow-hidden">
              {fileUrl ? (
                <img src={fileUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-[#45A29E]" />
                  <p className="mb-2 text-sm text-[#C5C6C7]"><span className="font-semibold text-[#66FCF1]">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-[#45A29E]">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
              <input type="file" className="hidden" onChange={onChange} />
            </label>
          </div>

          {chainId !== 34 && isConnected && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-sm flex items-center gap-3">
              <ShieldAlert className="w-4 h-4" />
              <span>You are on the wrong network. Please switch to SecureChain Mainnet.</span>
            </div>
          )}

          {status && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-[#66FCF1]/5 border border-[#66FCF1]/20 rounded-2xl shadow-[0_0_30px_rgba(102,252,241,0.05)]"
            >
              {status}
            </motion.div>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              if (chainId !== 34) {
                try {
                  setStatus('Switching to SecureChain AI Mainnet...');
                  await switchChainAsync({ chainId: 34 });
                } catch (e) {
                  toast.error("Failed to switch network. Please do it manually in your wallet.");
                  setStatus('');
                }
              } else {
                createMarketItem();
              }
            }}
            disabled={uploading}
            className="provenance-btn w-full !py-4"
          >
            {uploading ? 'Processing...' : (chainId !== 34 ? 'Switch to SecureChain Mainnet' : 'Mint & List Asset')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Mint;
