import { motion } from 'framer-motion';

const NFTCard = ({ item, isOwner, onAction }) => {
  return (
    <motion.div 
      whileHover={{ y: -10, boxShadow: '0 10px 30px -10px rgba(102,252,241,0.3)' }}
      className="bg-[#1e2024]/80 border border-[#45A29E]/30 rounded-xl overflow-hidden backdrop-blur-sm flex flex-col interactive"
    >
      <div className="relative aspect-square overflow-hidden bg-[#0B0C10]">
        <img 
          src={item.image} 
          alt={item.name} 
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
        <p className="text-[#C5C6C7] text-sm mb-4 line-clamp-2 flex-grow">{item.description}</p>
        
        <div className="flex justify-between items-end mt-auto">
          <div>
            <p className="text-xs text-[#45A29E] uppercase tracking-wider mb-1">Price</p>
            <p className="text-lg font-bold text-[#66FCF1]">{item.price} SCAI</p>
          </div>
          <button 
            onClick={() => onAction(item)}
            className="px-4 py-2 bg-[#66FCF1]/10 border border-[#66FCF1] text-[#66FCF1] rounded hover:bg-[#66FCF1] hover:text-[#0B0C10] transition-colors font-bold text-sm uppercase tracking-wide interactive"
          >
            {isOwner ? 'List Item' : 'Buy Now'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NFTCard;
