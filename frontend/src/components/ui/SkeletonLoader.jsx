import { motion } from 'framer-motion';

const SkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-[#1e2024]/50 border border-[#45A29E]/20 rounded-xl overflow-hidden backdrop-blur-sm animate-pulse">
          <div className="aspect-square bg-[#0B0C10]/50" />
          <div className="p-5">
            <div className="h-6 bg-[#45A29E]/30 rounded w-3/4 mb-4" />
            <div className="h-4 bg-[#45A29E]/20 rounded w-full mb-2" />
            <div className="h-4 bg-[#45A29E]/20 rounded w-5/6 mb-6" />
            
            <div className="flex justify-between items-end">
              <div>
                <div className="h-3 bg-[#45A29E]/30 rounded w-12 mb-2" />
                <div className="h-5 bg-[#66FCF1]/30 rounded w-20" />
              </div>
              <div className="h-8 bg-[#66FCF1]/20 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
