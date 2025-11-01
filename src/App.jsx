import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LeakSubmissionPage from './pages/LeakSubmissionPage';
import BlockchainLedgerPage from './pages/BlockchainLedgerPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/submit" element={<LeakSubmissionPage />} />
          <Route path="/ledger" element={<BlockchainLedgerPage />} />
          {/* Add routes for pages 3 and 7 when ready */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
