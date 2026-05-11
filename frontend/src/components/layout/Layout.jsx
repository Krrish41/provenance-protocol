import { lazy, Suspense } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const ParticleGrid = lazy(() => import('../3d/ParticleGrid'));
const CursorTrail = lazy(() => import('../3d/CursorTrail'));
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] font-mono relative overflow-x-hidden">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#0B0C10',
            color: '#66FCF1',
            border: '1px solid rgba(102, 252, 241, 0.3)',
            borderRadius: '12px',
            fontFamily: 'monospace',
            padding: '16px 24px',
            fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: {
              primary: '#66FCF1',
              secondary: '#0B0C10',
            },
          },
          error: {
            style: {
              background: '#0B0C10',
              color: '#ff4b4b',
              border: '1px solid rgba(255, 75, 75, 0.5)',
              boxShadow: '0 0 20px rgba(255, 75, 75, 0.2)',
            },
          }
        }}
      />
      <div className="fixed inset-0 z-0">
        <Suspense fallback={null}>
          <ParticleGrid />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <CursorTrail />
      </Suspense>
      
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
