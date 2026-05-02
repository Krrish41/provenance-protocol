import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Boxes, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'Mint', path: '/mint' },
    { name: 'Dashboard', path: '/my-provenance' },
    { name: 'Docs', path: '/protocol-docs' },
  ];

  return (
    <nav className="border-b border-[#45A29E]/30 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
          <Boxes className="w-8 h-8 text-[#66FCF1] transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold text-white tracking-wider">Provenance</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} active={location.pathname === link.path}>
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button 
                          onClick={async () => {
                            try {
                              await openConnectModal();
                            } catch (e) {
                              console.error("Wallet connection cancelled");
                            }
                          }} 
                          type="button" 
                          className="btn-primary px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-xs sm:text-sm interactive"
                        >
                          Connect Wallet
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button onClick={openChainModal} type="button" className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm font-bold">
                          Wrong Network
                        </button>
                      );
                    }

                    return (
                      <div className="flex gap-3">
                        <button
                          onClick={openChainModal}
                          style={{ display: 'flex', alignItems: 'center' }}
                          type="button"
                          className="hidden sm:flex items-center gap-2 bg-[#1e2024] border border-[#45A29E]/30 px-3 py-2 rounded-lg text-xs font-mono text-white hover:border-[#66FCF1] transition-colors"
                        >
                          {chain.hasIcon && (
                            <div style={{ background: chain.iconBackground, width: 12, height: 12, borderRadius: 999, overflow: 'hidden', marginRight: 4 }}>
                              {chain.iconUrl && <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} style={{ width: 12, height: 12 }} />}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <button onClick={openAccountModal} type="button" className="bg-[#1e2024] border border-[#45A29E]/30 px-3 py-2 rounded-lg text-xs sm:text-sm font-mono text-[#66FCF1] hover:border-[#66FCF1] transition-colors">
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-[#66FCF1] p-1" 
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
              className={`text-lg uppercase tracking-widest font-bold py-2 ${
                location.pathname === link.path ? 'text-[#66FCF1]' : 'text-[#C5C6C7]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link 
    to={to} 
    className={`transition-colors uppercase tracking-widest text-xs font-bold ${
      active ? 'text-[#66FCF1]' : 'text-[#C5C6C7] hover:text-[#66FCF1]'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
