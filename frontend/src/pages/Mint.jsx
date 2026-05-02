import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { UploadCloud, Loader2 } from 'lucide-react';
import { MARKETPLACE_ADDRESS, NFTMarketplaceABI } from '../utils/contract';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../utils/pinata';
import toast from 'react-hot-toast';

const Mint = () => {
  const [formInput, setFormInput] = useState({ price: '', name: '', description: '' });
  const [fileUrl, setFileUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

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
    setStatus('Uploading image to IPFS...');
    try {
      // 1. Upload image
      const imageURL = await uploadFileToIPFS(file);
      
      // 2. Upload metadata
      setStatus('Uploading metadata to IPFS...');
      const metadata = {
        name, description, image: imageURL
      };
      const tokenURI = await uploadJSONToIPFS(metadata);

      // 3. Interact with contract
      setStatus('Please approve transaction in Wallet...');
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(MARKETPLACE_ADDRESS, NFTMarketplaceABI, signer);

      const listingPrice = await contract.getListingPrice();
      const priceInWei = parseEther(formInput.price);

      setStatus('Minting & Listing...');
      let transaction = await contract.createToken(tokenURI, priceInWei, { value: listingPrice });
      await transaction.wait();
      
      toast.success('Successfully minted and listed!');
      setStatus('Successfully minted and listed!');
      setFormInput({ price: '', name: '', description: '' });
      setFile(null);
      setFileUrl(null);
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error("Error minting:", error);
      toast.error('Error occurred. Please try again.');
      setStatus('Error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  }


  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="py-8 max-w-2xl mx-auto"
    >
      <h2 className="text-3xl font-bold text-white mb-8 border-b border-[#45A29E]/30 pb-4">Mint New Asset</h2>
      
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
            className="w-full py-4 rounded-lg btn-primary interactive"
          >
            {uploading ? 'Processing...' : 'Mint & List Asset'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Mint;
