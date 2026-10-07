import React from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1e2024]/80 border border-[#45A29E]/30 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full text-center shadow-[0_0_40px_rgba(69,162,158,0.1)]"
          >
            <div className="w-16 h-16 mx-auto bg-[#45A29E]/10 rounded-full flex items-center justify-center mb-6 border border-[#45A29E]/30">
              <svg className="w-8 h-8 text-[#45A29E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-4">
              Protocol Interruption
            </h2>
            
            <p className="text-[#C5C6C7] mb-8">
              The application encountered an unexpected state, likely due to an aborted wallet connection or network mismatch.
            </p>
            
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-8 py-3 btn-primary rounded w-full interactive"
            >
              Reload Protocol
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
