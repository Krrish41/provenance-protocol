import { motion } from 'framer-motion';
import { EyeOff, Database, Share2 } from 'lucide-react';

const PrivacyPolicy = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
      className="py-12 max-w-4xl mx-auto px-4"
    >
      <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 tracking-tight">Privacy Policy</h1>
      <p className="text-[#45A29E] mb-10 font-mono uppercase tracking-[0.2em] text-[10px] md:text-sm">Last Updated: 2nd May 2026</p>

      <div className="space-y-6 md:space-y-8">
        <motion.section variants={itemVariants} className="bg-[#1e2024]/40 border border-[#45A29E]/20 rounded-xl p-5 md:p-8">
          <div className="flex items-center gap-4 mb-4 text-[#66FCF1]">
            <EyeOff className="w-5 h-5 md:w-6 md:h-6" />
            <h3 className="text-lg md:text-xl font-bold">1. Data Collection</h3>
          </div>
          <p className="text-[#C5C6C7] leading-relaxed">
            Provenance Protocol does not collect or store personal data. We do not use cookies for tracking, and we do not require users to provide emails, names, or addresses to use the interface.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-[#1e2024]/40 border border-[#45A29E]/20 rounded-xl p-5 md:p-8">
          <div className="flex items-center gap-4 mb-4 text-[#66FCF1]">
            <Database className="w-5 h-5 md:w-6 md:h-6" />
            <h3 className="text-lg md:text-xl font-bold">2. Blockchain Transparency</h3>
          </div>
          <p className="text-[#C5C6C7] leading-relaxed">
            All transactions initiated through the protocol are recorded on the SCAI Mainnet. Public blockchain data, including wallet addresses, NFT metadata, and transaction history, are immutable and visible to anyone on the network.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-[#1e2024]/40 border border-[#45A29E]/20 rounded-xl p-5 md:p-8">
          <div className="flex items-center gap-4 mb-4 text-[#66FCF1]">
            <Share2 className="w-5 h-5 md:w-6 md:h-6" />
            <h3 className="text-lg md:text-xl font-bold">3. Third-Party Services</h3>
          </div>
          <p className="text-[#C5C6C7] leading-relaxed">
            This interface may interact with third-party providers such as IPFS (via Pinata) for media storage and RPC nodes for blockchain connectivity. These services may have their own privacy policies regarding data handling.
          </p>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
