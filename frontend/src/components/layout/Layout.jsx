import Navbar from './Navbar';
import Footer from './Footer';
import ParticleGrid from '../3d/ParticleGrid';
import CursorTrail from '../3d/CursorTrail';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] font-mono relative overflow-x-hidden">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e2024',
            color: '#66FCF1',
            border: '1px solid rgba(69, 162, 158, 0.3)',
            borderRadius: '8px',
            fontFamily: 'monospace',
          },
          success: {
            iconTheme: {
              primary: '#66FCF1',
              secondary: '#1e2024',
            },
          },
          error: {
            style: {
              background: '#1e2024',
              color: '#ff4b4b',
              border: '1px solid rgba(255, 75, 75, 0.3)',
            },
          }
        }}
      />
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
