import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-[#45A29E]/20 py-12 bg-[#0B0C10] mt-20">
      <div className="container mx-auto px-4 flex flex-col items-center gap-6">
        <div className="flex gap-8 text-sm font-medium">
          <Link to="/contact" className="text-[#C5C6C7] hover:text-[#66FCF1] transition-all">Contact</Link>
          <Link to="/privacy" className="text-[#C5C6C7] hover:text-[#66FCF1] transition-all">Privacy Policy</Link>
          <Link to="/terms" className="text-[#C5C6C7] hover:text-[#66FCF1] transition-all">Terms of Service</Link>
        </div>
        
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#45A29E]/40 to-transparent"></div>
        
        <div className="text-center font-mono">
          <p className="text-[#45A29E] text-xs sm:text-sm tracking-tight whitespace-nowrap">
            Deployed 2nd May 2026 | Engineered by{' '}
            <span className="text-[#45A29E] hover:text-[#66FCF1] hover:drop-shadow-[0_0_8px_#66FCF1] transition-all duration-300 cursor-default font-bold">
              Krrish Ranjan
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};


export default Footer;

