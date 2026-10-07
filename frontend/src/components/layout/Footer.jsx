import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-[#45A29E]/20 py-12 bg-[#0B0C10] mt-20">
      <div className="container mx-auto px-4 flex flex-col items-center gap-8">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] sm:text-sm font-medium uppercase tracking-[0.1em]">
          <Link to="/contact" className="text-[#C5C6C7] hover:text-[#66FCF1] transition-all">Contact</Link>
          <Link to="/privacy" className="text-[#C5C6C7] hover:text-[#66FCF1] transition-all">Privacy Policy</Link>
          <Link to="/terms" className="text-[#C5C6C7] hover:text-[#66FCF1] transition-all">Terms of Service</Link>
        </div>
        
        <div className="h-px w-full max-w-md bg-gradient-to-r from-transparent via-[#45A29E]/30 to-transparent"></div>
        
        <div className="text-center font-mono">
          <p className="text-[#45A29E] text-[9px] sm:text-xs tracking-wider flex flex-col sm:flex-row items-center gap-1 sm:gap-0">
            <span>Deployed 2nd May 2026</span>
            <span className="hidden sm:inline mx-3 opacity-30">|</span>
            <span>Engineered by{' '}
              <span className="text-[#66FCF1]/80 hover:text-[#66FCF1] hover:drop-shadow-[0_0_8px_#66FCF1] transition-all duration-300 cursor-default font-bold">
                Krrish Ranjan
              </span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};


export default Footer;

