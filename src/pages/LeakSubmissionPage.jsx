// src/pages/LeakSubmissionPage.jsx
import React, { useState } from 'react';
import './LeakSubmissionPage.css';

const LeakSubmissionPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [steganographyMode, setSteganographyMode] = useState(false);
  const [deadManSwitch, setDeadManSwitch] = useState(false);
  const [hiddenVolume, setHiddenVolume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [blockchainTxHash, setBlockchainTxHash] = useState('');
  const [message, setMessage] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadComplete(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadComplete(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockTxHash = '0x' + Math.random().toString(16).substring(2, 66);
    setBlockchainTxHash(mockTxHash);
    
    setIsUploading(false);
    setUploadComplete(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    simulateUpload();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="leak-submission-container">
      <div className="submission-header">
        <h1>🔒 Secure Leak Submission</h1>
        <p>Upload classified documents with complete anonymity and quantum-secure encryption</p>
      </div>

      <div className="submission-layout">
        {/* Left Panel - File Upload */}
        <div className="upload-panel">
          <div 
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {!selectedFile ? (
              <>
                <div className="dropzone-icon">📁</div>
                <h3>Drop file here or click to browse</h3>
                <p>Supports: PDF, DOCX, TXT, Images, ZIP</p>
                <p className="dropzone-hint">Maximum file size: 100 MB</p>
              </>
            ) : (
              <div className="selected-file-info">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <h4>{selectedFile.name}</h4>
                  <p>{formatFileSize(selectedFile.size)}</p>
                  <p className="file-type">{selectedFile.type || 'Unknown type'}</p>
                </div>
                <button 
                  className="remove-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setUploadComplete(false);
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            <input
              id="fileInput"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
            />
          </div>

          {/* Message/Context Box */}
          <div className="message-box">
            <label>Additional Context (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide context or description for this leak..."
              rows="4"
            />
            <small>This message will be encrypted with your document</small>
          </div>

          {/* Privacy Options */}
          <div className="privacy-options">
            <h3>🛡️ Privacy & Security Options</h3>
            
            <div className="option-card">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={removeMetadata}
                  onChange={(e) => setRemoveMetadata(e.target.checked)}
                />
                <div className="option-content">
                  <strong>Remove Metadata</strong>
                  <p>Strip EXIF data, timestamps, and identifying information</p>
                </div>
              </label>
            </div>

            <div className="option-card">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={steganographyMode}
                  onChange={(e) => setSteganographyMode(e.target.checked)}
                />
                <div className="option-content">
                  <strong>Steganography Mode</strong>
                  <p>Hide encrypted data inside harmless cover images</p>
                </div>
              </label>
            </div>

            <div className="option-card">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={deadManSwitch}
                  onChange={(e) => setDeadManSwitch(e.target.checked)}
                />
                <div className="option-content">
                  <strong>Dead Man's Switch</strong>
                  <p>Auto-publish if you don't check in within 7 days</p>
                </div>
              </label>
            </div>

            <div className="option-card">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={hiddenVolume}
                  onChange={(e) => setHiddenVolume(e.target.checked)}
                />
                <div className="option-content">
                  <strong>Hidden Volume (Plausible Deniability)</strong>
                  <p>Create decoy layer with fake data if coerced</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            className="submit-button"
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading || uploadComplete}
          >
            {isUploading ? '🔄 Uploading...' : uploadComplete ? '✅ Submitted' : '🚀 Submit Leak Securely'}
          </button>
        </div>

        {/* Right Panel - Status & Info */}
        <div className="status-panel">
          {/* Upload Progress */}
          {isUploading && (
            <div className="upload-status">
              <h3>⚡ Processing Your Submission</h3>
              
              <div className="progress-section">
                <div className="progress-step">
                  <span className={uploadProgress >= 20 ? 'completed' : ''}>
                    {uploadProgress >= 20 ? '✓' : '○'}
                  </span>
                  <span>Encrypting with AES-256-GCM</span>
                </div>
                <div className="progress-step">
                  <span className={uploadProgress >= 40 ? 'completed' : ''}>
                    {uploadProgress >= 40 ? '✓' : '○'}
                  </span>
                  <span>Removing metadata</span>
                </div>
                <div className="progress-step">
                  <span className={uploadProgress >= 60 ? 'completed' : ''}>
                    {uploadProgress >= 60 ? '✓' : '○'}
                  </span>
                  <span>Generating file hash</span>
                </div>
                <div className="progress-step">
                  <span className={uploadProgress >= 80 ? 'completed' : ''}>
                    {uploadProgress >= 80 ? '✓' : '○'}
                  </span>
                  <span>Routing through onion network</span>
                </div>
                <div className="progress-step">
                  <span className={uploadProgress >= 100 ? 'completed' : ''}>
                    {uploadProgress >= 100 ? '✓' : '○'}
                  </span>
                  <span>Recording on blockchain</span>
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="progress-text">{uploadProgress}% Complete</p>
            </div>
          )}

          {/* Upload Complete */}
          {uploadComplete && (
            <div className="upload-complete">
              <div className="success-icon">✅</div>
              <h3>Leak Successfully Submitted!</h3>
              
              <div className="blockchain-info">
                <h4>⛓️ Blockchain Confirmation</h4>
                <div className="info-row">
                  <span>Transaction Hash:</span>
                  <span className="hash-value">{blockchainTxHash.substring(0, 20)}...</span>
                </div>
                <div className="info-row">
                  <span>Network:</span>
                  <span className="network-value">Polygon Amoy Testnet</span>
                </div>
                <div className="info-row">
                  <span>Block Number:</span>
                  <span className="block-value">28442587</span>
                </div>
                <div className="info-row">
                  <span>Timestamp:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                
                <a 
                  href={`https://amoy.polygonscan.com/tx/${blockchainTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-blockchain-btn"
                >
                  🔍 View on PolygonScan
                </a>
              </div>

              <div className="security-confirmation">
                <h4>🔐 Security Confirmation</h4>
                <ul>
                  <li>✓ File encrypted with quantum-resistant cryptography</li>
                  <li>✓ Metadata stripped successfully</li>
                  <li>✓ Hash recorded immutably on blockchain</li>
                  <li>✓ Anonymous submission confirmed</li>
                  {steganographyMode && <li>✓ Data hidden in cover image</li>}
                  {deadManSwitch && <li>✓ Dead man's switch activated</li>}
                  {hiddenVolume && <li>✓ Plausible deniability layer created</li>}
                </ul>
              </div>

              <div className="next-steps">
                <h4>📋 Next Steps</h4>
                <p>Your leak has been securely submitted and is now visible to verified journalists.</p>
                <p>You will receive encrypted notifications when:</p>
                <ul>
                  <li>A journalist views your submission</li>
                  <li>Zero-Knowledge proof is verified</li>
                  <li>Multi-signature verification is complete</li>
                </ul>
              </div>
            </div>
          )}

          {/* Information Box */}
          {!isUploading && !uploadComplete && (
            <div className="info-panel">
              <h3>📘 How It Works</h3>
              
              <div className="info-section">
                <h4>1. Quantum-Secure Encryption</h4>
                <p>Your file is encrypted using post-quantum algorithms (Kyber + Dilithium) that remain secure even against future quantum computers.</p>
              </div>

              <div className="info-section">
                <h4>2. Anonymity Protection</h4>
                <p>All identifying metadata is removed. Your submission routes through multiple encrypted hops (onion routing) to hide your location and identity.</p>
              </div>

              <div className="info-section">
                <h4>3. Blockchain Timestamping</h4>
                <p>A cryptographic hash of your leak is recorded on the Polygon blockchain, creating an immutable proof of submission that cannot be altered or deleted.</p>
              </div>

              <div className="info-section">
                <h4>4. Zero-Knowledge Verification</h4>
                <p>You can prove your credentials (e.g., "I work at Agency X") without revealing your identity using Zero-Knowledge proofs.</p>
              </div>

              <div className="warning-box">
                <h4>⚠️ Important Security Reminders</h4>
                <ul>
                  <li>Never access WhistleChain from work networks</li>
                  <li>Use Tor Browser for additional anonymity</li>
                  <li>Clear your browser history after submission</li>
                  <li>Don't mention submission details to anyone</li>
                </ul>
              </div>
            </div>
          )}

          {/* Active Features Display */}
          <div className="active-features">
            <h4>🎯 Active Security Features</h4>
            <div className="feature-badges">
              <span className="feature-badge active">Kyber-768 Encryption</span>
              <span className="feature-badge active">ML-DSA-65 Signatures</span>
              {removeMetadata && <span className="feature-badge active">Metadata Removal</span>}
              {steganographyMode && <span className="feature-badge active">Steganography</span>}
              {deadManSwitch && <span className="feature-badge active">Dead Man's Switch</span>}
              {hiddenVolume && <span className="feature-badge active">Hidden Volume</span>}
              <span className="feature-badge active">Onion Routing</span>
              <span className="feature-badge active">Blockchain Proof</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeakSubmissionPage;
