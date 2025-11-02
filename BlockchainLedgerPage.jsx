// src/pages/BlockchainLedgerPage.jsx
import React, { useState, useEffect } from 'react';
import './BlockchainLedgerPage.css';

const BlockchainLedgerPage = () => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchHash, setSearchHash] = useState('');

  // Generate mock blockchain data
  useEffect(() => {
    const mockBlocks = [
      {
        id: 28442587,
        hash: '0x9cf95c5ffeb18e6c6409b20a3bd1a6e06d7766371e13eb0f5ca13d00d681dcd6',
        prevHash: '0x7a3f8e2b9c4d1a5f6e8d0c2b4a6e8f0d2c4b6a8e0f2d4c6b8a0e2f4d6c8a0e2f',
        timestamp: '2025-11-01 10:23:45',
        leakHash: '0x3bd1a6e06d7766371e13eb0f5ca13d00d681dcd6',
        signatures: ['0x8a2f...', '0x4b3d...', '0x9e5c...'],
        verifications: 3,
        type: 'leak_submission',
        network: 'Polygon Amoy',
        gasUsed: 21000
      },
      {
        id: 28442586,
        hash: '0x7a3f8e2b9c4d1a5f6e8d0c2b4a6e8f0d2c4b6a8e0f2d4c6b8a0e2f4d6c8a0e2f',
        prevHash: '0x5b1c6d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
        timestamp: '2025-11-01 09:45:22',
        leakHash: '0x6d7766371e13eb0f5ca13d00d681dcd6',
        signatures: ['0x3c1f...', '0x7d4e...'],
        verifications: 2,
        type: 'verification',
        network: 'Polygon Amoy',
        gasUsed: 18500
      },
      {
        id: 28442585,
        hash: '0x5b1c6d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
        prevHash: '0x2a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9',
        timestamp: '2025-11-01 08:12:33',
        leakHash: '0x1e13eb0f5ca13d00d681dcd6',
        signatures: ['0x6e2a...'],
        verifications: 1,
        type: 'leak_submission',
        network: 'Polygon Amoy',
        gasUsed: 19800
      },
      {
        id: 28442584,
        hash: '0x2a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9',
        prevHash: '0x1f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8',
        timestamp: '2025-10-31 22:30:11',
        leakHash: '0x5ca13d00d681dcd6',
        signatures: ['0x9f3b...', '0x2d7e...', '0x5a1c...', '0x8b4f...'],
        verifications: 4,
        type: 'multi_sig_verification',
        network: 'Polygon Amoy',
        gasUsed: 23400
      },
      {
        id: 28442583,
        hash: '0x1f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8',
        prevHash: '0x0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9',
        timestamp: '2025-10-31 18:45:59',
        leakHash: '0xd00d681dcd6',
        signatures: ['0x4c2a...', '0x7e5b...'],
        verifications: 2,
        type: 'verification',
        network: 'Polygon Amoy',
        gasUsed: 17200
      }
    ];
    setBlocks(mockBlocks);
  }, []);

  const filteredBlocks = blocks.filter(block => {
    if (filter !== 'all' && block.type !== filter) return false;
    if (searchHash && !block.hash.toLowerCase().includes(searchHash.toLowerCase()) && 
        !block.leakHash.toLowerCase().includes(searchHash.toLowerCase())) return false;
    return true;
  });

  const getBlockTypeColor = (type) => {
    switch(type) {
      case 'leak_submission': return '#e74c3c';
      case 'verification': return '#3498db';
      case 'multi_sig_verification': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getBlockTypeIcon = (type) => {
    switch(type) {
      case 'leak_submission': return '📤';
      case 'verification': return '✅';
      case 'multi_sig_verification': return '🔏';
      default: return '⛓️';
    }
  };

  const getBlockTypeName = (type) => {
    switch(type) {
      case 'leak_submission': return 'Leak Submission';
      case 'verification': return 'Journalist Verification';
      case 'multi_sig_verification': return 'Multi-Signature Verification';
      default: return 'Unknown';
    }
  };

  return (
    <div className="blockchain-ledger-container">
      <div className="ledger-header">
        <h1>⛓️ Blockchain Ledger Explorer</h1>
        <p>Immutable, transparent record of all leak submissions and verifications</p>
      </div>

      {/* Controls */}
      <div className="ledger-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by hash..."
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            All Transactions
          </button>
          <button 
            className={filter === 'leak_submission' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('leak_submission')}
          >
            📤 Leak Submissions
          </button>
          <button 
            className={filter === 'verification' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('verification')}
          >
            ✅ Verifications
          </button>
          <button 
            className={filter === 'multi_sig_verification' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('multi_sig_verification')}
          >
            🔏 Multi-Sig
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ledger-content">
        {/* Blockchain Visualization */}
        <div className="blockchain-visualization">
          <h3>📊 Live Blockchain Network</h3>
          <div className="blockchain-3d">
            {filteredBlocks.map((block, index) => (
              <React.Fragment key={block.id}>
                <div 
                  className={`block-node ${selectedBlock?.id === block.id ? 'selected' : ''}`}
                  style={{ borderColor: getBlockTypeColor(block.type) }}
                  onClick={() => setSelectedBlock(block)}
                >
                  <div className="block-icon" style={{ backgroundColor: getBlockTypeColor(block.type) }}>
                    {getBlockTypeIcon(block.type)}
                  </div>
                  <div className="block-number">#{block.id}</div>
                  <div className="block-verif">{block.verifications} ✓</div>
                </div>
                {index < filteredBlocks.length - 1 && (
                  <div className="chain-connector">
                    <div className="connector-line"></div>
                    <div className="connector-arrow">→</div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Block Details */}
        {selectedBlock ? (
          <div className="block-details">
            <div className="details-header">
              <h3>
                <span style={{ color: getBlockTypeColor(selectedBlock.type) }}>
                  {getBlockTypeIcon(selectedBlock.type)}
                </span>
                {' '}Block #{selectedBlock.id}
              </h3>
              <span 
                className="block-type-badge"
                style={{ 
                  backgroundColor: getBlockTypeColor(selectedBlock.type) + '20',
                  color: getBlockTypeColor(selectedBlock.type),
                  borderColor: getBlockTypeColor(selectedBlock.type)
                }}
              >
                {getBlockTypeName(selectedBlock.type)}
              </span>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Block Hash</span>
                <span className="detail-value hash">{selectedBlock.hash}</span>
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(selectedBlock.hash)}>
                  📋
                </button>
              </div>

              <div className="detail-item">
                <span className="detail-label">Previous Hash</span>
                <span className="detail-value hash">{selectedBlock.prevHash}</span>
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(selectedBlock.prevHash)}>
                  📋
                </button>
              </div>

              <div className="detail-item">
                <span className="detail-label">Leak Hash</span>
                <span className="detail-value leak-hash">{selectedBlock.leakHash}</span>
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(selectedBlock.leakHash)}>
                  📋
                </button>
              </div>

              <div className="detail-row">
                <div className="detail-col">
                  <span className="detail-label">Timestamp</span>
                  <span className="detail-value">{selectedBlock.timestamp}</span>
                </div>
                <div className="detail-col">
                  <span className="detail-label">Network</span>
                  <span className="detail-value network">{selectedBlock.network}</span>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-col">
                  <span className="detail-label">Gas Used</span>
                  <span className="detail-value">{selectedBlock.gasUsed.toLocaleString()}</span>
                </div>
                <div className="detail-col">
                  <span className="detail-label">Verifications</span>
                  <span className="detail-value verif">{selectedBlock.verifications} ✓</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-label">Signatures ({selectedBlock.signatures.length})</span>
                <div className="signatures-list">
                  {selectedBlock.signatures.map((sig, idx) => (
                    <div key={idx} className="signature-item">
                      <span className="sig-icon">✍️</span>
                      <span className="sig-value">{sig}</span>
                      <span className="sig-status">Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="details-actions">
              <a 
                href={`https://amoy.polygonscan.com/tx/${selectedBlock.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn primary"
              >
                🔍 View on PolygonScan
              </a>
              <button className="action-btn secondary">
                📄 Export Block Data
              </button>
              <button className="action-btn secondary">
                🔗 Share Block Link
              </button>
            </div>
          </div>
        ) : (
          <div className="no-selection">
            <div className="no-selection-icon">⛓️</div>
            <h3>Select a Block</h3>
            <p>Click on any block above to view its detailed information</p>
          </div>
        )}
      </div>

      {/* Stats Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div className="stat-content">
            <h4>Total Leaks</h4>
            <p className="stat-value">
              {blocks.filter(b => b.type === 'leak_submission').length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h4>Verified Leaks</h4>
            <p className="stat-value">
              {blocks.filter(b => b.type === 'verification' || b.type === 'multi_sig_verification').length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔏</div>
          <div className="stat-content">
            <h4>Total Signatures</h4>
            <p className="stat-value">
              {blocks.reduce((sum, b) => sum + b.signatures.length, 0)}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⛽</div>
          <div className="stat-content">
            <h4>Total Gas Used</h4>
            <p className="stat-value">
              {blocks.reduce((sum, b) => sum + b.gasUsed, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="ledger-info">
        <h3>🔐 Why Blockchain Matters</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>🛡️ Immutability</h4>
            <p>Once a leak is recorded, it cannot be altered or deleted. Even if servers are seized, the record remains.</p>
          </div>
          <div className="info-card">
            <h4>⏱️ Timestamping</h4>
            <p>Every submission is permanently timestamped, proving exactly when it was submitted.</p>
          </div>
          <div className="info-card">
            <h4>🔍 Transparency</h4>
            <p>Anyone can verify the authenticity of a leak by checking the blockchain record.</p>
          </div>
          <div className="info-card">
            <h4>🔒 Privacy-Preserving</h4>
            <p>Only cryptographic hashes are stored on-chain, not the actual content or source identity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainLedgerPage;
