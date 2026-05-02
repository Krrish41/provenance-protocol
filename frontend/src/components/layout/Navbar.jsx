import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount, useDisconnect } from 'wagmi';
import { Boxes, Menu, X, LogOut } from 'lucide-react';
import ProvenanceWalletModal from '../ui/ProvenanceWalletModal';
import { useWalletModal } from '../../context/WalletModalContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isWalletModalOpen, openWalletModal, closeWalletModal } = useWalletModal();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'Mint', path: '/mint' },
    { name: 'Dashboard', path: '/my-provenance' },
    { name: 'Architecture', path: '/protocol-docs' },
  ];

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <nav className="border-b border-[#45A29E]/30 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-50 h-20">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
            <Boxes className="w-8 h-8 text-[#66FCF1] transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-white tracking-wider">Provenance</span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} active={location.pathname === link.path}>
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              {isConnected ? (
                <div className="flex items-center gap-3">
                  <div className="bg-[#1e2024] border border-[#45A29E]/30 px-4 py-2 rounded flex items-center gap-2 group cursor-default">
                    <div className="w-2 h-2 rounded-full bg-[#66FCF1] animate-pulse" />
                    <span className="text-[#66FCF1] font-mono text-sm">{formatAddress(address)}</span>
                  </div>
                  <button 
                    onClick={() => disconnect()}
                    className="p-2 text-[#45A29E] hover:text-red-400 transition-colors"
                    title="Disconnect"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={openWalletModal} 
                  className="provenance-btn"
                >
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-[#66FCF1] p-1 focus:outline-none" 
              onClick={toggleMenu}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-20 left-0 w-full bg-[#0B0C10] border-b border-[#45A29E]/30 py-6 px-4 flex flex-col gap-4 z-40 backdrop-blur-xl shadow-2xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`text-lg uppercase tracking-widest font-bold py-1 ${
                  location.pathname === link.path ? 'text-[#66FCF1]' : 'text-[#C5C6C7]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-[#45A29E]/10">
              {isConnected ? (
                <button 
                  onClick={() => { disconnect(); closeMenu(); }}
                  className="w-full bg-[#1e2024] border border-red-500/50 text-red-400 py-4 rounded text-base font-mono font-bold flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  Disconnect {formatAddress(address)}
                </button>
              ) : (
                <button 
                  onClick={() => { openWalletModal(); closeMenu(); }} 
                  className="provenance-btn w-full py-4 text-lg"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Custom Wallet Modal */}
      <ProvenanceWalletModal 
        isOpen={isWalletModalOpen} 
        onClose={closeWalletModal} 
      />
    </>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link 
    to={to} 
    className={`transition-colors uppercase tracking-widest text-base font-bold ${
      active ? 'text-[#66FCF1]' : 'text-[#C5C6C7] hover:text-[#66FCF1]'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
