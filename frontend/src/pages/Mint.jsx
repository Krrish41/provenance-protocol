import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { parseEther, formatEther } from 'viem';
import { UploadCloud, Loader2, ShieldAlert, ExternalLink, AlertTriangle } from 'lucide-react';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../utils/contract';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../utils/pinata';
import toast from 'react-hot-toast';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useWalletClient } from 'wagmi';
import { useWalletModal } from '../context/WalletModalContext';

const Mint = () => {
  const { isConnected, address } = useAccount();
  const { openWalletModal } = useWalletModal();
  const publicClient = usePublicClient();
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
    setStatus('Uploading assets to IPFS...');
    try {
      // 1. IPFS Upload
      const imageURL = await uploadFileToIPFS(file);
      const metadata = { name, description, image: imageURL };
      const tokenURI = await uploadJSONToIPFS(metadata);

      setStatus('Preparing transaction...');

      // 2. Network Check
      const chainId = await publicClient.getChainId();
      if (chainId !== 34) {
        throw new Error("Please switch to SecureChain AI Mainnet (Chain ID: 34)");
      }

      // 3. Contract Logic Preparation
      const listingPrice = await publicClient.readContract({
        address: MARKETPLACE_ADDRESS,
        abi: NFTMarketplaceABI,
        functionName: 'getListingPrice',
      });

      const priceInWei = parseEther(formInput.price);

      setStatus('Simulating & Estimating Gas...');

      // 4. Gas & Fee Hardening
      // We simulate first to ensure the tx will succeed
      const { request } = await publicClient.simulateContract({
        address: MARKETPLACE_ADDRESS,
        abi: NFTMarketplaceABI,
        functionName: 'createToken',
        args: [tokenURI, priceInWei],
        value: listingPrice,
        account: address,
      });

      const gasEstimate = await publicClient.estimateGas({
        ...request,
        account: address,
      });

      // Add 30% buffer to gas limit
      const gasLimit = (gasEstimate * 130n) / 100n;

      // Force legacy gas price calculation for SCAI compatibility
      const feeData = await publicClient.estimateFeesPerGas();
      const gasPrice = (feeData.gasPrice * 120n) / 100n;

      setStatus('Confirm Legacy Mint (Type 0) in Wallet...');

      // 5. Raw EXECUTION: Bypass hooks to ensure strictly legacy payload
      if (!walletClient) throw new Error("Wallet not fully initialized. Please try again.");

      const hash = await walletClient.writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: NFTMarketplaceABI,
        functionName: 'createToken',
        args: [tokenURI, priceInWei],
        value: listingPrice,
        account: address,
        type: 'legacy',               // Strictly Type 0 (Legacy)
        gas: paddedGasLimit,           // 20% padded limit
        gasPrice: gasPriceWithBuffer,   // Standard gasPrice (No EIP-1559 fields!)
      });

      setTxHash(hash);
      
      const explorerUrl = `https://explorer.securechain.ai/tx/${hash}`;
      setStatus(
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Transaction Sent! Waiting for block...</span>
          </div>
          <a 
            href={explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#66FCF1] underline hover:text-white transition-colors text-xs"
          >
            View on Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      );

    } catch (error) {
      console.error("Minting error:", error);
      let errorMessage = 'Minting failed';

      // Parse common error patterns
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction rejected by user.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient SCAI for gas + listing price.';
      } else if (error.message?.includes('-32603') || error.message?.includes('rate limit')) {
        errorMessage = 'RPC node is rate limited. Retrying in background...';
        // Logic to potentially retry would go here, but Wagmi handles some retries
      } else if (error.message?.includes('exceeds block gas limit')) {
        errorMessage = 'Gas limit too high or block full. Try again shortly.';
      } else {
        errorMessage = error.shortMessage || error.message || 'Unknown execution error';
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

          {status && (
            <div className="p-4 bg-[#66FCF1]/10 border border-[#66FCF1]/30 rounded-lg text-[#66FCF1] text-sm flex items-center gap-3">
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {status}
            </div>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createMarketItem}
            disabled={uploading}
            className="provenance-btn w-full !py-4"
          >
            {uploading ? 'Processing...' : 'Mint & List Asset'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Mint;
