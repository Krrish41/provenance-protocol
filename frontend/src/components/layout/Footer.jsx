import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-[#45A29E]/30 py-8 bg-[#0B0C10]/90 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-6 text-sm">
          <Link to="/contact" className="hover:text-[#66FCF1] transition-colors">Contact</Link>
          <Link to="/protocol-docs" className="hover:text-[#66FCF1] transition-colors">Documentation</Link>
        </div>
        <div className="text-center md:text-right">
          <p className="text-sm text-[#45A29E]">2nd May 2026 made by Krrish Ranjan</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
