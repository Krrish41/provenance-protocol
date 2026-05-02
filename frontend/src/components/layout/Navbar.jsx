import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Boxes } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="border-b border-[#45A29E]/30 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Boxes className="w-8 h-8 text-[#66FCF1] transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold text-white tracking-wider">Provenance</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/explore">Explore</NavLink>
          <NavLink to="/mint">Mint</NavLink>
          <NavLink to="/my-provenance">Dashboard</NavLink>
          <NavLink to="/protocol-docs">Docs</NavLink>
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="text-[#C5C6C7] hover:text-[#66FCF1] transition-colors uppercase tracking-wide text-sm font-semibold"
  >
    {children}
  </Link>
);

export default Navbar;
