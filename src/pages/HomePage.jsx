// src/pages/HomePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState('pqc');

  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero-section">
        <h1 className="hero-title">WhistleChain</h1>
        <p className="hero-subtitle">
          Secure Whistleblowing for the Quantum Era
        </p>
        <p className="hero-description">
          A decentralized, quantum-secure leak submission and verification platform
          for whistleblowers and journalists
        </p>
        
        <div className="hero-buttons">
          <button 
            className="btn-primary" 
            onClick={() => navigate('/submit')}
          >
            Submit Leak
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/chat')}  //to add messaging chat page later
          >
            Message
          </button>
          <button 
            className="btn-tertiary"
            onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
          >
            Visualization
          </button>
        </div>
      </header>

      {/* Interactive Demo Section */}
      <section className="demo-section">
        <h2>See How It Works</h2>
        
        <div className="demo-tabs">
          <button 
            className={activeDemo === 'pqc' ? 'tab active' : 'tab'}
            onClick={() => setActiveDemo('pqc')}
          >
            Post-Quantum Cryptography
          </button>
          <button 
            className={activeDemo === 'blockchain' ? 'tab active' : 'tab'}
            onClick={() => setActiveDemo('blockchain')}
          >
            Blockchain Integration
          </button>
          <button 
            className={activeDemo === 'steganography' ? 'tab active' : 'tab'}
            onClick={() => setActiveDemo('steganography')}
          >
            Steganography 
          </button>
        </div>

        {/* PQC Demo */}
        {activeDemo === 'pqc' && (
          <PQCDemo />
        )}

        {/* Blockchain Demo */}
        {activeDemo === 'blockchain' && (
          <BlockchainDemo />
        )}

        {/* Steganography Demo */}
        {activeDemo === 'steganography' && (
          <SteganographyDemo />
        )}
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <h2>Why WhistleChain?</h2>
        
        <div className="feature-grid">
          <FeatureCard 
            icon="🔐"
            title="Quantum-Resistant Security"
            description="Uses Kyber and Dilithium algorithms to ensure encryption stays secure even against future quantum computers"
          />
          <FeatureCard 
            icon="🕵️"
            title="Complete Anonymity"
            description="Zero-Knowledge proofs let you prove credentials without revealing identity. No usernames, no emails"
          />
          <FeatureCard 
            icon="⛓️"
            title="Immutable Proof"
            description="Blockchain timestamps ensure leaks cannot be altered, deleted, or denied once submitted"
          />
          <FeatureCard 
            icon="🌐"
            title="Decentralized Network"
            description="No central server to hack or shut down. Mesh networking works even during internet outages"
          />
          <FeatureCard 
            icon="✅"
            title="Multi-Signature Verification"
            description="Multiple journalists can co-sign verified leaks, enhancing collective trust and authenticity"
          />
          <FeatureCard 
            icon="🎯"
            title="Advanced Privacy Features"
            description="Steganography mode, dead man's switch, and plausible deniability for maximum protection"
          />
        </div>
      </section>

      {/* Problem Statement */}
      <section className="problem-section">
        <h2>The Problem We Solve</h2>
        
        <div className="problem-grid">
          <ProblemCard 
            title="Whistleblowers Face Extreme Risk"
            example="Edward Snowden had to flee his country. Chelsea Manning was caught via metadata traces."
            solution="PQC encryption + ZK-proofs + blockchain ensure complete anonymity and future-proof security"
          />
          <ProblemCard 
            title="Hard to Verify Anonymous Leaks"
            example="Panama Papers required massive verification efforts with risk to sources"
            solution="Zero-Knowledge proofs let sources prove credibility without revealing identity"
          />
          <ProblemCard 
            title="Data Tampering & Fake Leaks"
            example="Forged leaks spread to confuse public or harm journalists"
            solution="Blockchain timestamps create immutable records that cannot be altered"
          />
          <ProblemCard 
            title="Internet Censorship"
            example="Iran and Myanmar cut internet during protests to silence voices"
            solution="Peer-to-peer mesh networking allows communication without internet"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Built with Post-Quantum Cryptography • Powered by Polygon Blockchain</p>
        <p>© 2025 WhistleChain • Securing Truth for Tomorrow</p>
      </footer>
    </div>
  );
};

// PQC Demo Component
const PQCDemo = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { title: 'Key Generation', desc: 'Generating Kyber-768 keypair...', color: '#3498db' },
    { title: 'Key Encapsulation', desc: 'Creating shared secret with quantum-resistant algorithm...', color: '#2ecc71' },
    { title: 'Message Signing', desc: 'Signing with ML-DSA-65 (Dilithium)...', color: '#e74c3c' },
    { title: 'Verification', desc: '✅ Signature verified! Communication secured.', color: '#27ae60' }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="demo-content pqc-demo">
      <div className="demo-visual">
        <div className="pqc-nodes">
          <div className="node source">
            <span className="node-label">Whistleblower</span>
            <div className="key-icon">🔑</div>
          </div>
          
          <div className="connection-line" style={{ 
            background: `linear-gradient(90deg, transparent, ${steps[step].color}, transparent)`,
            animation: 'pulse 2s infinite'
          }}>
            <div className="packet" style={{ backgroundColor: steps[step].color }}>
              📦
            </div>
          </div>
          
          <div className="node journalist">
            <span className="node-label">Journalist</span>
            <div className="key-icon">🔐</div>
          </div>
        </div>
        
        <div className="step-indicator">
          <h3>{steps[step].title}</h3>
          <p>{steps[step].desc}</p>
        </div>
        
        <div className="algorithm-info">
          <div className="algo-badge">Kyber-768 (Key Exchange)</div>
          <div className="algo-badge">ML-DSA-65 (Signatures)</div>
          <div className="algo-badge">AES-256-GCM (Encryption)</div>
        </div>
      </div>
    </div>
  );
};

// Blockchain Demo Component
const BlockchainDemo = () => {
  const [blockAdded, setBlockAdded] = useState(false);
  
  const handleAddBlock = () => {
    setBlockAdded(true);
    setTimeout(() => setBlockAdded(false), 3000);
  };

  return (
    <div className="demo-content blockchain-demo">
      <div className="demo-visual">
        <h3>Real-Time Blockchain Verification</h3>
        
        <div className="blockchain-chain">
          <div className="block">
            <div className="block-header">Block #28442583</div>
            <div className="block-content">
              <p>Hash: 0x7a3f...</p>
              <p>Timestamp: 2025-10-30 14:23:11</p>
            </div>
          </div>
          
          <div className="chain-arrow">→</div>
          
          <div className={`block ${blockAdded ? 'new-block' : ''}`}>
            <div className="block-header">Block #28442584</div>
            <div className="block-content">
              <p>Hash: 0x9cf9...</p>
              <p>Leak Hash: 0x3bd1...</p>
              <p>Timestamp: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <button className="demo-button" onClick={handleAddBlock}>
          📤 Submit Sample Leak
        </button>
        
        {blockAdded && (
          <div className="blockchain-confirmation">
            <p>✅ Leak hashed and recorded on Polygon Amoy testnet</p>
            <p>Transaction: 0xff5157c58214ea8e93d12fd0f840015b...</p>
            <a href="https://amoy.polygonscan.com" target="_blank" rel="noopener noreferrer">
              View on PolygonScan →
            </a>
          </div>
        )}
        
        <div className="blockchain-features">
          <div className="feature-badge">⛓️ Immutable</div>
          <div className="feature-badge">⏱️ Timestamped</div>
          <div className="feature-badge">🔍 Transparent</div>
          <div className="feature-badge">🛡️ Tamper-Proof</div>
        </div>
      </div>
    </div>
  );
};

// Steganography Demo Component
const SteganographyDemo = () => {
  const [encoded, setEncoded] = useState(false);

  return (
    <div className="demo-content stego-demo">
      <div className="demo-visual">
        <h3>Hide Encrypted Data in Images</h3>
        
        <div className="stego-comparison">
          <div className="image-container">
            <div className="demo-image cat-image">🐱</div>
            <p>Normal Cat Photo</p>
            <p className="image-size">Size: 245 KB</p>
          </div>
          
          <div className="encode-arrow">
            <button 
              className="encode-button"
              onClick={() => setEncoded(!encoded)}
            >
              {encoded ? '🔓 Decode' : '🔒 Encode'}
            </button>
          </div>
          
          <div className="image-container">
            <div className="demo-image cat-image-encoded">
              🐱
              {encoded && <div className="hidden-data">📄 Hidden Document</div>}
            </div>
            <p>Cat Photo + Hidden Leak</p>
            <p className="image-size">Size: 247 KB</p>
          </div>
        </div>
        
        {encoded && (
          <div className="stego-explanation">
            <p>✅ Encrypted leak data is now hidden inside the image using LSB steganography</p>
            <p>🕵️ To an observer, it looks like an innocent cat photo</p>
            <p>🔐 Only you and the recipient with the decryption key can extract the hidden data</p>
          </div>
        )}
        
        <div className="stego-use-case">
          <h4>Use Case:</h4>
          <p>Share "vacation photos" on social media that secretly contain encrypted whistleblower documents. 
             Even if intercepted, adversaries only see harmless images.</p>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

// Problem Card Component
const ProblemCard = ({ title, example, solution }) => (
  <div className="problem-card">
    <h3>{title}</h3>
    <div className="problem-example">
      <strong>Real Example:</strong>
      <p>{example}</p>
    </div>
    <div className="problem-solution">
      <strong>Our Solution:</strong>
      <p>{solution}</p>
    </div>
  </div>
);

export default HomePage;
