import { motion } from 'framer-motion';
import { Database, Shield, Activity, Workflow } from 'lucide-react';

const ProtocolDocs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="py-12 px-4 md:px-0 max-w-4xl mx-auto"
    >
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 border-b border-[#45A29E]/30 pb-4 text-center tracking-tight">
        Protocol Architecture
      </h1>

      <div className="space-y-12 md:space-y-16">
        
        <motion.section variants={itemVariants} className="bg-[#1e2024]/50 border border-[#45A29E]/30 rounded-xl p-6 md:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 md:gap-4 mb-6">
            <div className="p-2 md:p-3 bg-[#66FCF1]/10 rounded-lg text-[#66FCF1]">
              <Workflow className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#66FCF1]">1. How It Works</h3>
          </div>
          <p className="text-[#C5C6C7] leading-relaxed mb-4 text-sm md:text-base">
            The Provenance Protocol acts as a decentralized escrow and registry system. When a user mints a digital asset, it is cryptographically signed and stored on the InterPlanetary File System (IPFS). 
          </p>
          <p className="text-[#C5C6C7] leading-relaxed text-sm md:text-base">
            Upon listing, the smart contract takes temporary custody of the ERC-721 token (escrow). When a buyer meets the asking price, the protocol executes an atomic swap: routing the payment to the seller, a minimal fee to the protocol treasury, and the asset directly to the buyer's wallet.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-[#1e2024]/50 border border-[#45A29E]/30 rounded-xl p-6 md:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 md:gap-4 mb-6">
            <div className="p-2 md:p-3 bg-[#66FCF1]/10 rounded-lg text-[#66FCF1]">
              <Activity className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#66FCF1]">2. Asset Lifecycle</h3>
          </div>
          <ol className="list-decimal list-inside text-[#C5C6C7] space-y-4 ml-2 text-sm md:text-base">
            <li><strong className="text-white">Creation:</strong> User uploads media (Image/Video) to IPFS via Pinata API.</li>
            <li><strong className="text-white">Metadata Generation:</strong> A JSON file binding the media URI with attributes is generated and pinned to IPFS.</li>
            <li><strong className="text-white">Tokenization:</strong> The JSON URI is passed to the SCAI Mainnet smart contract, minting a unique ERC-721 token.</li>
            <li><strong className="text-white">Market Listing:</strong> The token is listed at a fixed SCAI price, awaiting decentralized execution.</li>
          </ol>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-[#1e2024]/50 border border-[#45A29E]/30 rounded-xl p-6 md:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 md:gap-4 mb-6">
            <div className="p-2 md:p-3 bg-[#66FCF1]/10 rounded-lg text-[#66FCF1]">
              <Database className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#66FCF1]">3. Protocol Architecture</h3>
          </div>
          <p className="text-[#C5C6C7] leading-relaxed mb-4 text-sm md:text-base">
            The system relies on the <strong className="text-[#66FCF1]">SCAI Mainnet</strong> for consensus and state management. The core contract inherits from OpenZeppelin's extensively audited standard libraries to ensure ERC-721 compliance.
          </p>
          <p className="text-[#C5C6C7] leading-relaxed text-sm md:text-base">
            By deploying on SCAI, the protocol achieves sub-second finality and near-zero gas costs, solving the primary friction points found in legacy Ethereum-based marketplaces.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-[#1e2024]/50 border border-[#45A29E]/30 rounded-xl p-6 md:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 md:gap-4 mb-6">
            <div className="p-2 md:p-3 bg-[#66FCF1]/10 rounded-lg text-[#66FCF1]">
              <Shield className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#66FCF1]">4. Governance & Security</h3>
          </div>
          <p className="text-[#C5C6C7] leading-relaxed mb-4 text-sm md:text-base">
            Security is paramount. The primary <strong className="text-[#66FCF1]">NFTMarketplace.sol</strong> contract utilizes a <code className="bg-[#0B0C10] px-2 py-1 rounded text-[#45A29E] text-xs">ReentrancyGuard</code> on all value-transferring functions to prevent recursive fallback attacks.
          </p>
          <p className="text-[#C5C6C7] leading-relaxed">
            In its initial phase, the protocol is permissioned for upgrades by the deploying multi-sig wallet. Future iterations will transition control to a DAO-governed decentralized autonomous structure utilizing the native SCAI token for voting weight.
          </p>
        </motion.section>

      </div>
    </motion.div>
  );
};

export default ProtocolDocs;
