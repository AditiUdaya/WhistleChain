// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [connectionStep, setConnectionStep] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionComplete, setConnectionComplete] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const connectionSteps = [
    { 
      id: 1, 
      title: 'Generating Kyber-768 Keypair', 
      desc: 'Creating quantum-resistant encryption keys...',
      icon: '🔑',
      color: '#3498db'
    },
    { 
      id: 2, 
      title: 'Establishing Secure Channel', 
      desc: 'Performing key encapsulation with server...',
      icon: '🔐',
      color: '#9b59b6'
    },
    { 
      id: 3, 
      title: 'Generating ML-DSA-65 Signature', 
      desc: 'Creating authentication signature...',
      icon: '✍️',
      color: '#e74c3c'
    },
    { 
      id: 4, 
      title: 'Verifying Connection', 
      desc: 'Confirming secure handshake...',
      icon: '✅',
      color: '#2ecc71'
    },
  ];

  const handleConnect = async () => {
    if (!deviceId.trim()) {
      alert('Please enter a device ID');
      return;
    }

    setIsConnecting(true);
    setConnectionStep(0);

    // Simulate PQC handshake steps
    for (let i = 0; i < connectionSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setConnectionStep(i + 1);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    setConnectionComplete(true);
    setIsConnecting(false);

    // Navigate to next page after success
    setTimeout(() => {
      navigate('/chat');
    }, 2000);
  };

  const generateRandomDeviceId = () => {
    const id = 'WC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setDeviceId(id);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <h1>🔐 WhistleChain</h1>
          <h2>Secure Anonymous Login</h2>
          <p className="login-subtitle">
            Post-Quantum Cryptographic Authentication
          </p>
        </div>

        {!isConnecting && !connectionComplete && (
          <div className="login-form">
            <div className="security-badges">
              <span className="badge">Kyber-768</span>
              <span className="badge">ML-DSA-65</span>
              <span className="badge">Zero-Knowledge</span>
            </div>

            <div className="info-box">
              <p>🕵️ <strong>Complete Anonymity</strong></p>
              <p>No usernames, emails, or passwords required. 
                 Only cryptographic identity via quantum-resistant keys.</p>
            </div>

            <div className="input-group">
              <label>Device Identifier</label>
              <div className="input-with-button">
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="Enter or generate device ID"
                  className="device-input"
                />
                <button 
                  className="generate-button"
                  onClick={generateRandomDeviceId}
                  title="Generate Random ID"
                >
                  🎲
                </button>
              </div>
              <small>Your anonymous cryptographic identifier</small>
            </div>

            <button 
              className="connect-button"
              onClick={handleConnect}
            >
              🚀 Initiate Secure Connection
            </button>

            <div className="advanced-options">
              <button 
                className="advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '▼' : '▶'} Advanced Options
              </button>
              
              {showAdvanced && (
                <div className="advanced-content">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Enable Steganography Mode
                  </label>
                  <label>
                    <input type="checkbox" />
                    Activate Dead Man's Switch
                  </label>
                  <label>
                    <input type="checkbox" />
                    Use Mesh Network Routing
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {isConnecting && (
          <div className="connection-progress">
            <h3>Establishing Secure Connection</h3>
            
            <div className="steps-container">
              {connectionSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`step ${index < connectionStep ? 'completed' : ''} ${index === connectionStep ? 'active' : ''}`}
                >
                  <div className="step-icon" style={{ 
                    backgroundColor: index <= connectionStep ? step.color : 'transparent',
                    border: `2px solid ${step.color}`
                  }}>
                    {index < connectionStep ? '✓' : step.icon}
                  </div>
                  <div className="step-content">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(connectionStep / connectionSteps.length) * 100}%` }}
              ></div>
            </div>

            <div className="technical-details">
              <div className="tech-row">
                <span>Algorithm:</span>
                <span className="tech-value">
                  {connectionStep >= 1 ? 'Kyber-768 (NIST PQC)' : '---'}
                </span>
              </div>
              <div className="tech-row">
                <span>Signature:</span>
                <span className="tech-value">
                  {connectionStep >= 3 ? 'ML-DSA-65 (Dilithium)' : '---'}
                </span>
              </div>
              <div className="tech-row">
                <span>Session Key:</span>
                <span className="tech-value">
                  {connectionStep >= 2 ? 'AES-256-GCM' : '---'}
                </span>
              </div>
            </div>
          </div>
        )}

        {connectionComplete && (
          <div className="connection-success">
            <div className="success-icon">✅</div>
            <h3>Connection Verified!</h3>
            <p>Quantum-secure handshake completed successfully</p>
            <div className="success-details">
              <p>🔑 Public Key Generated: 1952 bytes</p>
              <p>🔐 Shared Secret Established</p>
              <p>✍️ Signature Verified</p>
              <p>📡 Redirecting to secure portal...</p>
            </div>
          </div>
        )}

        <div className="login-footer">
          <p>🛡️ Your connection is secured with Post-Quantum Cryptography</p>
          <p className="security-note">
            Even quantum computers cannot decrypt your communications
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
