import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl px-4"
      >
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight leading-[1.1]">
          True Digital <span className="text-[#66FCF1] sm:block sm:mt-2">Provenance.</span>
        </h1>
        <p className="text-[#C5C6C7] text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed opacity-80">
          The next-generation NFT marketplace secured by the SCAI Mainnet.
          Mint, trade, and verify assets with unparalleled speed and zero compromises.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link to="/explore">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(102, 252, 241, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-transparent border border-[#66FCF1] text-[#66FCF1] font-bold rounded-lg uppercase tracking-wider backdrop-blur-sm"
            >
              Explore Market
            </motion.button>
          </Link>
          <Link to="/mint">
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(102, 252, 241, 0.9)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#66FCF1] text-[#0B0C10] font-bold rounded-lg uppercase tracking-wider shadow-[0_0_15px_rgba(102,252,241,0.5)]"
            >
              Mint NFT
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
