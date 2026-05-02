import Navbar from './Navbar';
import Footer from './Footer';
import ParticleGrid from '../3d/ParticleGrid';
import CursorTrail from '../3d/CursorTrail';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] font-mono relative overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <ParticleGrid />
      </div>
      <CursorTrail />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
