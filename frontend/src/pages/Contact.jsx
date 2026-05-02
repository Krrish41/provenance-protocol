import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

const Contact = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-12 max-w-2xl mx-auto text-center"
    >
      <h2 className="text-3xl font-bold text-white mb-8 border-b border-[#45A29E]/30 pb-4">Contact & Support</h2>
      
      <div className="bg-[#1e2024]/50 border border-[#45A29E]/30 rounded-xl p-10 backdrop-blur-sm">
        <Mail className="w-12 h-12 text-[#66FCF1] mx-auto mb-6" />
        <p className="text-[#C5C6C7] text-lg mb-6">
          For technical support, protocol inquiries, or security disclosures, please reach out at:
        </p>
        <a 
          href="mailto:krrish4173@gmail.com" 
          className="text-2xl font-bold text-[#66FCF1] hover:text-white transition-colors"
        >
          krrish4173@gmail.com
        </a>
      </div>
    </motion.div>
  );
};

export default Contact;
