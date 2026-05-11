import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { Boxes, Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import ProvenanceWalletModal from '../ui/ProvenanceWalletModal';
import { useWalletModal } from '../../context/WalletModalContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isWalletModalOpen, openWalletModal, closeWalletModal } = useWalletModal();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  const { data: balance } = useBalance({
    address: address,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'Mint', path: '/mint' },
    { name: 'Dashboard', path: '/my-provenance' },
    { name: 'Management', path: '/manage-assets' },
    { name: 'Architecture', path: '/protocol-docs' },
  ];

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal) => {
    if (!bal) return '0.00';
    return parseFloat(bal.formatted).toFixed(2);
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
            <div className="hidden md:block relative" ref={dropdownRef}>
              {isConnected ? (
                <div className="flex items-center gap-3">
                  {/* Profile Avatar Trigger */}
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-[#45A29E] bg-[#1e2024]/50 text-[#66FCF1] hover:border-[#66FCF1] hover:shadow-[0_0_15px_rgba(102,252,241,0.3)] transition-all duration-300 relative group"
                  >
                    <User size={20} />
                  </motion.button>

                  {/* Desktop Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-[#0B0C10] border border-[#45A29E] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
                        style={{ top: '100%' }}
                      >
                        <div className="p-4 space-y-4">
                          <div className="space-y-1">
                            <p className="text-[#45A29E] text-[10px] uppercase font-mono tracking-widest">Protocol Address</p>
                            <p className="text-[#C5C6C7] font-mono text-sm">{formatAddress(address)}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-[#45A29E] text-[10px] uppercase font-mono tracking-widest">SCAI Balance</p>
                            <p className="text-[#66FCF1] font-mono text-lg font-bold">
                              {formatBalance(balance)} <span className="text-[10px]">SCAI</span>
                            </p>
                          </div>

                          <div className="border-b border-[#45A29E]/20" />

                          <button 
                            onClick={() => {
                              disconnect();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center justify-between p-2 rounded hover:bg-[#1e2024] text-[#C5C6C7] hover:text-red-400 transition-all duration-200 group"
                          >
                            <span className="text-xs uppercase font-bold tracking-widest">Disconnect</span>
                            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-20 left-0 w-full bg-[#0B0C10] border-b border-[#45A29E]/30 py-6 px-4 flex flex-col gap-4 z-40 backdrop-blur-xl shadow-2xl overflow-hidden"
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
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col p-4 rounded-md border border-[#45A29E]/30 bg-[#0B0C10]/80 backdrop-blur-sm w-full mb-3">
                      <div className="text-xs font-mono text-[#C5C6C7] mb-1">{formatAddress(address)}</div>
                      <div className="text-lg font-bold text-[#66FCF1] tracking-wide">
                        {formatBalance(balance)} <span className="text-xs text-[#45A29E] font-normal uppercase">SCAI</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { disconnect(); closeMenu(); }}
                      className="w-full flex items-center justify-center py-3 rounded-md text-sm tracking-widest uppercase font-semibold text-[#ff4d4d] bg-[#ff4d4d]/5 border border-[#ff4d4d]/20 transition-all active:bg-[#ff4d4d]/10"
                    >
                      <LogOut size={18} className="mr-2" />
                      Disconnect
                    </button>
                  </div>
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
        </AnimatePresence>
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
