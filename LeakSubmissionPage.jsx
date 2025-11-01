// src/pages/LeakSubmissionPage.jsx
import React, { useState } from 'react';
import './LeakSubmissionPage.css';

const LeakSubmissionPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [sender, setSender] = useState('alice'); // choose sender for test
  const [receiver, setReceiver] = useState('bob'); // auto opposite of sender
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [steganographyMode, setSteganographyMode] = useState(false);
  const [deadManSwitch, setDeadManSwitch] = useState(false);
  const [hiddenVolume, setHiddenVolume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [blockchainTxHash, setBlockchainTxHash] = useState('');
  const [blockchainTxLink, setBlockchainTxLink] = useState('');
  const [fileId, setFileId] = useState('');
  const [hashOnChain, setHashOnChain] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'application/zip'
  ];

  // keep receiver in sync with sender by default
  const onSenderChange = (s) => {
    setSender(s);
    setReceiver(s === 'alice' ? 'bob' : 'alice');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum: 100MB. You selected ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`File type not allowed. Allowed: PDF, DOCX, TXT, JPG, PNG, ZIP`);
      return;
    }

    setSelectedFile(file);
    setUploadComplete(false);
    setError('');
    setUploadProgress(0);
    setBlockchainTxHash('');
    setBlockchainTxLink('');
    setFileId('');
    setHashOnChain('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect({ target: { files: [file] } });
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!selectedFile) {
      setError('Please select a file');
      return;
    }
    if (!sender || !receiver) {
      setError('Please select sender and receiver');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(5); // quick visual feedback

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('message', message || '');
      formData.append('removeMetadata', String(removeMetadata));
      formData.append('steganographyMode', String(steganographyMode));
      formData.append('deadManSwitch', String(deadManSwitch));
      formData.append('hiddenVolume', String(hiddenVolume));
      // Backend expects sender & receiver
      formData.append('sender', sender);
      formData.append('receiver', receiver);

      // POST to backend /upload (matches server.js)
      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || `Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // show results returned by server
      setBlockchainTxHash(data.hash || data.txHash || '');
      setBlockchainTxLink(data.txLink || (data.txHash ? `${BASE_URL}/tx/${data.txHash}` : ''));
      setFileId(data.file_id || '');
      setHashOnChain(data.hash || '');

      setUploadProgress(100);
      setUploadComplete(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed: ' + (err.message || String(err)));
      setIsUploading(false);
      setUploadProgress(0);
      return;
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Download metadata JSON for the uploaded file
  const handleDownloadMetadata = async () => {
    if (!fileId) {
      setError('No file_id available. Upload first.');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/metadata/${fileId}`);
      if (!res.ok) throw new Error('Metadata download failed');
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileId}.meta.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to download metadata: ' + err.message);
    }
  };

  // Download encrypted file payload (the .enc JSON the server saved)
  const handleDownloadEncrypted = async () => {
    if (!fileId) {
      setError('No file_id available. Upload first.');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/download/${fileId}`);
      if (!res.ok) throw new Error('Encrypted file download failed');
      // server sends file as text (JSON content), or attachment — handle both
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileId;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Failed to download encrypted file: ' + err.message);
    }
  };

  return (
    <div className="leak-submission-container">
      <div className="submission-header">
        <h1>🔒 Secure Leak Submission</h1>
        <p>Upload classified documents with anonymity and post-quantum encryption</p>
      </div>

      <div className="submission-layout">
        <div className="upload-panel">
          {error && <div className="error-box">{error}</div>}

          <div className="sender-row" style={{ marginBottom: 12 }}>
            <label style={{ marginRight: 8 }}>Sender:</label>
            <select value={sender} onChange={(e) => onSenderChange(e.target.value)}>
              <option value="alice">alice</option>
              <option value="bob">bob</option>
            </select>
            <span style={{ marginLeft: 16 }}>Receiver: <strong>{receiver}</strong></span>
            <small style={{ marginLeft: 12, color: '#666' }}> (Open a second tab and pick the other user to test)</small>
          </div>

          <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('fileInput')?.click()}
            style={{
              border: '2px dashed #ccc',
              borderRadius: 8,
              padding: 20,
              cursor: 'pointer',
              marginBottom: 12,
            }}
          >
            {!selectedFile ? (
              <>
                <div className="dropzone-icon">📁</div>
                <h3>Drop file here or click to browse</h3>
                <p>Supports: PDF, DOCX, TXT, Images, ZIP — Max 100 MB</p>
              </>
            ) : (
              <div className="selected-file-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="file-icon">📄</div>
                  <div>
                    <h4 style={{ margin: 0 }}>{selectedFile.name}</h4>
                    <p style={{ margin: 0 }}>{formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown'}</p>
                  </div>
                </div>
                <button
                  className="remove-file-btn"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
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

          <div className="message-box" style={{ marginBottom: 12 }}>
            <label>Additional Context (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide context or description for this leak..."
              rows="4"
              style={{ width: '100%' }}
            />
          </div>
{/*
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={removeMetadata} onChange={(e) => setRemoveMetadata(e.target.checked)} />
              Remove Metadata
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={steganographyMode} onChange={(e) => setSteganographyMode(e.target.checked)} />
              Steganography Mode
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={deadManSwitch} onChange={(e) => setDeadManSwitch(e.target.checked)} />
              Dead Man's Switch
            </label>
          </div>*/}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading || uploadComplete}
              style={{ padding: '10px 16px' }}
            >
              {isUploading ? '🔄 Uploading...' : uploadComplete ? '✅ Submitted' : '🚀 Submit Leak Securely'}
            </button>

            {uploadComplete && fileId && (
              <>
                <button onClick={handleDownloadEncrypted} style={{ padding: '10px 12px' }}>⬇️ Download Encrypted</button>
                <button onClick={handleDownloadMetadata} style={{ padding: '10px 12px' }}>📄 Download Metadata</button>
              </>
            )}
          </div>

          {isUploading && (
            <div style={{ marginTop: 12 }}>
              <div style={{ background: '#eee', height: 8, borderRadius: 4 }}>
                <div style={{ width: `${uploadProgress}%`, height: 8, background: '#2ecc71', borderRadius: 4 }} />
              </div>
              <p style={{ marginTop: 6 }}>{uploadProgress}%</p>
            </div>
          )}
        </div>

        <div className="status-panel" style={{ minWidth: 320 }}>
          {uploadComplete && (
            <div className="upload-complete">
              <div className="success-icon">✅</div>
              <h3>Leak Successfully Submitted!</h3>

              <div style={{ marginTop: 8 }}>
                <div><strong>File ID:</strong> {fileId || '—'}</div>
                <div style={{ marginTop: 6 }}><strong>SHA256 (on-chain):</strong> {hashOnChain || '—'}</div>
                <div style={{ marginTop: 6 }}>
                  <strong>Blockchain TX:</strong>
                  {blockchainTxLink ? (
                    <a href={blockchainTxLink} target="_blank" rel="noreferrer" style={{ marginLeft: 8 }}>
                      View Transaction
                    </a>
                  ) : blockchainTxHash ? (
                    <span style={{ marginLeft: 8 }}>{blockchainTxHash}</span>
                  ) : <span style={{ marginLeft: 8 }}>—</span>}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <h4>Next step: Decrypt (optional)</h4>
                <p style={{ margin: 0 }}>
                  To decrypt the downloaded encrypted file you can use the Node CLI tool you already have:
                </p>
                <pre style={{ background: '#f6f6f6', padding: 8, marginTop: 8 }}>
{`node decrypt.js ${fileId} <receiver> http://localhost:3000`}
                </pre>
                <small style={{ color: '#666' }}>
                  Make sure you have the receiver's secret key copied into <code>./crypto/userKeys.json</code> on the machine running the CLI.
                </small>
              </div>
            </div>
          )}

          {!isUploading && !uploadComplete && (
            <div className="info-panel">
              <h3>📘 How It Works</h3>
              <div className="info-section">
                <h4>1. Quantum-Secure Encryption</h4>
                <p>Your file is encrypted server-side using Kyber-768 + AES-256-GCM.</p>
              </div>
              <div className="info-section">
                <h4>2. Anonymity & Metadata</h4>
                <p>Metadata can be stripped before encryption. Submission includes no client IP in on-chain record.</p>
              </div>
              <div className="info-section">
                <h4>3. Blockchain Timestamp</h4>
                <p>Server records SHA256 hash of the encrypted payload on Polygon for immutable proof.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeakSubmissionPage;
