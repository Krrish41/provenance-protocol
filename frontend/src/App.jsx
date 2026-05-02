import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Mint from './pages/Mint';
import Dashboard from './pages/Dashboard';
import ProtocolDocs from './pages/ProtocolDocs';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/mint" element={<Mint />} />
          <Route path="/my-provenance" element={<Dashboard />} />
          <Route path="/protocol-docs" element={<ProtocolDocs />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
