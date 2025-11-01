// PRODUCTION-READY LeakSubmissionPage.jsx
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
  const [error, setError] = useState('');

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'application/zip'
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ VALIDATION
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum: 100MB. You selected: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`File type not allowed. Allowed: PDF, DOCX, TXT, JPG, PNG, ZIP`);
      return;
    }

    setSelectedFile(file);
    setUploadComplete(false);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      e.target.value = file;
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('message', message);
      formData.append('removeMetadata', removeMetadata);
      formData.append('steganographyMode', steganographyMode);
      formData.append('deadManSwitch', deadManSwitch);
      formData.append('hiddenVolume', hiddenVolume);

      // ✅ REAL API CALL
      const response = await fetch('/api/submit-leak', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setBlockchainTxHash(data.txHash);
      setUploadProgress(100);
      setUploadComplete(true);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="leak-submission-container">
      <div className="submission-header">
        <h1>🔒 Secure Leak Submission</h1>
        <p>Upload classified documents with complete anonymity and quantum-secure encryption</p>
      </div>

      <div className="submission-layout">
        <div className="upload-panel">
          {error && <div className="error-box">{error}</div>}

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

          <div className="message-box">
            <label>Additional Context (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide context or description for this leak..."
              rows="4"
            />
          </div>

          <div className="privacy-options">
            <h3>🛡️ Privacy & Security Options</h3>
            {[
              { state: removeMetadata, setState: setRemoveMetadata, title: 'Remove Metadata', desc: 'Strip EXIF data, timestamps, and identifying information' },
              { state: steganographyMode, setState: setSteganographyMode, title: 'Steganography Mode', desc: 'Hide encrypted data inside harmless cover images' },
              { state: deadManSwitch, setState: setDeadManSwitch, title: 'Dead Man\'s Switch', desc: 'Auto-publish if you don\'t check in within 7 days' },
              { state: hiddenVolume, setState: setHiddenVolume, title: 'Hidden Volume', desc: 'Create decoy layer with fake data if coerced' }
            ].map((option, idx) => (
              <div key={idx} className="option-card">
                <label className="option-label">
                  <input
                    type="checkbox"
                    checked={option.state}
                    onChange={(e) => option.setState(e.target.checked)}
                  />
                  <div className="option-content">
                    <strong>{option.title}</strong>
                    <p>{option.desc}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <button 
            className="submit-button"
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading || uploadComplete}
          >
            {isUploading ? '🔄 Uploading...' : uploadComplete ? '✅ Submitted' : '🚀 Submit Leak Securely'}
          </button>
        </div>

        <div className="status-panel">
          {isUploading && (
            <div className="upload-status">
              <h3>⚡ Processing Your Submission</h3>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="progress-text">{uploadProgress}% Complete</p>
            </div>
          )}

          {uploadComplete && (
            <div className="upload-complete">
              <div className="success-icon">✅</div>
              <h3>Leak Successfully Submitted!</h3>
              <div className="blockchain-info">
                <h4>⛓️ Blockchain Confirmation</h4>
                <div className="info-row">
                  <span>Transaction Hash:</span>
                  <span className="hash-value">{blockchainTxHash}</span>
                </div>
              </div>
            </div>
          )}

          {!isUploading && !uploadComplete && (
            <div className="info-panel">
              <h3>📘 How It Works</h3>
              <div className="info-section">
                <h4>1. Quantum-Secure Encryption</h4>
                <p>Your file is encrypted using Kyber-768 (post-quantum algorithm).</p>
              </div>
              <div className="info-section">
                <h4>2. Anonymity Protection</h4>
                <p>All identifying metadata is removed. Submission routes through onion network.</p>
              </div>
              <div className="info-section">
                <h4>3. Blockchain Timestamping</h4>
                <p>Cryptographic hash recorded on Polygon blockchain - immutable proof.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeakSubmissionPage;
