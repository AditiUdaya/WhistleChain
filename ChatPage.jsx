// src/pages/ChatPage.jsx — adapted to backend (PQC messaging)
import React, { useState, useEffect, useRef } from 'react';
import './ChatPage.css';

const ChatPage = () => {
  const [userId, setUserId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // ✅ Match backend (no /api prefix)
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ------------------ Initialize user ------------------ */
  const handleInitialize = async () => {
    if (!userId.trim()) {
      setError('Please select a user');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ Ping backend to verify user keys exist
      const res = await fetch(`${BASE_URL}/publicKey/${userId.trim()}`);
      if (!res.ok) throw new Error('Backend unreachable');

      setCurrentUser(userId.trim());
      setIsInitialized(true);

      // Auto-select opposite user as recipient
      const otherUser = userId.trim() === 'alice' ? 'bob' : 'alice';
      setRecipientId(otherUser);
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Cannot connect to server. Make sure backend is running on http://localhost:3000');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Fetch Messages ------------------ */
  const fetchMessages = async () => {
    if (!currentUser) return;

    try {
      // ✅ Ask backend for any messages for this user
      const response = await fetch(`${BASE_URL}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver: currentUser }),
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        const newMsgs = data.map((m) => ({
          id: Date.now() + Math.random(),
          senderId: m.from,
          recipientId: currentUser,
          decryptedContent: m.message,
          authenticated: m.verified,
          timestamp: m.timestamp || new Date().toISOString(),
        }));

        // Append newly received messages
        setMessages((prev) => [...prev, ...newMsgs]);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  /* ------------------ Poll messages ------------------ */
  useEffect(() => {
    if (isInitialized && currentUser) {
      fetchMessages(); // initial fetch
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [isInitialized, currentUser]);

  /* ------------------ Send Message ------------------ */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !recipientId) {
      setError('Please enter a message and select a recipient');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ Match backend format exactly
      const response = await fetch(`${BASE_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUser,
          receiver: recipientId,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (data.status === 'sent') {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            senderId: currentUser,
            recipientId,
            decryptedContent: message.trim(),
            authenticated: true,
            timestamp: new Date().toISOString(),
          },
        ]);
        setMessage('');
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI: Before Initialization ------------------ */
  if (!isInitialized) {
    return (
      <div className="chat-container">
        <div className="chat-init-screen">
          <div className="init-card">
            <h1>🔐 WhistleChain Secure Chat</h1>
            <p className="init-subtitle">Post-Quantum Encrypted User-to-User Messaging</p>

            <div className="security-info">
              <div className="security-badge"><span className="badge-icon">🔑</span>Kyber + ML-DSA</div>
              <div className="security-badge"><span className="badge-icon">🔒</span>End-to-End AES-GCM</div>
              <div className="security-badge"><span className="badge-icon">🧩</span>Blockchain Logging</div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="init-form">
              <label className="form-label">Choose your username:</label>
              <div className="button-group">
                <button 
                  onClick={() => setUserId('alice')}
                  className={`user-button ${userId === 'alice' ? 'active' : ''}`}
                >👩 Alice</button>
                <button 
                  onClick={() => setUserId('bob')}
                  className={`user-button ${userId === 'bob' ? 'active' : ''}`}
                >👨 Bob</button>
              </div>

              {userId && (
                <button 
                  onClick={handleInitialize}
                  disabled={loading}
                  className="init-button"
                >
                  {loading ? '🔄 Connecting...' : '🚀 Start Secure Chat'}
                </button>
              )}
            </div>

            <div className="init-info">
              <h3>📋 How It Works:</h3>
              <ul>
                <li>✅ Select Alice or Bob</li>
                <li>✅ PQC keypairs already loaded on backend</li>
                <li>✅ Messages encrypted with AES-256-GCM</li>
                <li>✅ Blockchain used for integrity logs</li>
                <li>✅ Open another tab as other user</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------ UI: Chat Window ------------------ */
  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <h2>🔐 Secure Chat</h2>
          <span className="user-badge">You: {currentUser}</span>
        </div>
        <div className="header-right">
          <span className="status-indicator">🟢 Connected</span>
          <button 
            className="logout-btn"
            onClick={() => {
              setIsInitialized(false);
              setCurrentUser(null);
              setUserId('');
              setRecipientId('');
              setMessages([]);
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="chat-layout">
        {/* Sidebar */}
        <div className="users-sidebar">
          <h3>📋 Users</h3>
          <div className="users-list">
            {['alice', 'bob'].map((user) => (
              <div
                key={user}
                className={`user-item ${recipientId === user ? 'active' : ''}`}
                onClick={() => user !== currentUser && setRecipientId(user)}
              >
                <div className="user-avatar">{user === 'alice' ? '👩' : '👨'}</div>
                <div className="user-info">
                  <div className="user-name">{user}{user === currentUser && ' (You)'}</div>
                  <div className="user-status">🔐 PQC Enabled</div>
                </div>
              </div>
            ))}
          </div>

          <div className="sidebar-info">
            <h4>💡 Tip:</h4>
            <p>Open another tab and log in as the other user to chat securely.</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          {recipientId ? (
            <>
              <div className="chat-recipient-header">
                <div className="recipient-avatar">{recipientId === 'alice' ? '👩' : '👨'}</div>
                <div className="recipient-info">
                  <h3>{recipientId}</h3>
                  <p className="encryption-status">🔒 End-to-End PQC Encryption</p>
                </div>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>💬 No messages yet</p>
                    <p className="subtitle">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.senderId === currentUser ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p className="message-text">{msg.decryptedContent}</p>
                        <div className="message-footer">
                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                          {msg.authenticated && msg.senderId !== currentUser && (
                            <span className="verified-badge">✅ Verified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="message-input-form">
                {error && <div className="error-banner">{error}</div>}
                <input
                  type="text"
                  placeholder="Type a quantum-secure message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="message-input"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="send-btn"
                  disabled={loading || !message.trim()}
                >
                  {loading ? '🔄' : '📤'} Send
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Select a user to start chatting</h3>
              <p>All messages are encrypted with post-quantum cryptography</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;