import { motion } from 'framer-motion';
import { Scale, ShieldAlert, Key, Zap } from 'lucide-react';

const TermsOfService = () => {
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
      <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Terms of Service</h1>
      <p className="text-[#45A29E] mb-12 font-mono uppercase tracking-[0.2em] text-sm">Last Updated: 2nd May 2026</p>

      <div className="space-y-8">
        <motion.section variants={itemVariants} className="bg-[#1e2024]/40 border border-[#45A29E]/20 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-4 text-[#66FCF1]">
            <Scale className="w-6 h-6" />
            <h3 className="text-xl font-bold">1. Non-Custodial Protocol</h3>
          </div>
          <p className="text-[#C5C6C7] leading-relaxed">
            Provenance Protocol provides a non-custodial interface for interacting with digital assets on the SCAI Mainnet. We do not take custody of your funds or private keys. All transactions are executed directly by the users through smart contracts.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-[#1e2024]/40 border border-[#45A29E]/20 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-4 text-[#66FCF1]">
            <Key className="w-6 h-6" />
            <h3 className="text-xl font-bold">2. User Responsibility</h3>
          </div>
          <p className="text-[#C5C6C7] leading-relaxed">
            Users are solely responsible for managing their private keys and maintaining the security of their digital wallets. Provenance Protocol cannot recover lost keys or reverse transactions initiated by the user.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-[#1e2024]/40 border border-[#45A29E]/20 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-4 text-[#66FCF1]">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="text-xl font-bold">3. Risks and "As Is" Warranty</h3>
          </div>
          <p className="text-[#C5C6C7] leading-relaxed">
            Interacting with smart contracts carries inherent risks, including but not limited to protocol bugs or network failures. The service is provided "as is" and "as available" without warranties of any kind.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="bg-[#1e2024]/40 border border-[#45A29E]/20 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-4 text-[#66FCF1]">
            <Zap className="w-6 h-6" />
            <h3 className="text-xl font-bold">4. Compliance and SCAI Mainnet</h3>
          </div>
          <p className="text-[#C5C6C7] leading-relaxed">
            By using this interface, you acknowledge that all transactions occur on the SCAI Mainnet, a decentralized blockchain network. You are responsible for ensuring your use of the protocol complies with all applicable laws and regulations in your jurisdiction.
          </p>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default TermsOfService;
