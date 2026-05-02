import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-[#45A29E]/20 py-12 bg-[#0B0C10] mt-20">
      <div className="container mx-auto px-4 flex flex-col items-center gap-6">
        <div className="flex gap-8 text-sm font-medium">
          <Link to="/contact" className="text-[#C5C6C7] hover:text-[#66FCF1] transition-all hover:scale-105">Contact</Link>
          <Link to="/privacy" className="text-[#C5C6C7] hover:text-[#66FCF1] transition-all hover:scale-105">Privacy Policy</Link>
          <Link to="/terms" className="text-[#C5C6C7] hover:text-[#66FCF1] transition-all hover:scale-105">Terms of Service</Link>
        </div>
        
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#45A29E]/40 to-transparent"></div>
        
        <div className="text-center space-y-3">
          <p className="text-[10px] tracking-[0.3em] text-[#45A29E]/60 uppercase font-bold">
            2nd May 2026 • PROVENANCE PROTOCOL
          </p>
          <div className="flex items-center justify-center gap-2 text-[#C5C6C7] group">
            <span className="text-sm">Crafted with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse group-hover:scale-125 transition-transform" />
            <span className="text-sm">by <span className="text-[#66FCF1] font-semibold tracking-wide">Krrish Ranjan</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

