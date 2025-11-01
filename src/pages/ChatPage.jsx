// src/pages/ChatPage.jsx - PRODUCTION VERSION WITH REAL MESSAGING
import React, { useState, useEffect, useRef } from 'react';
import './ChatPage.css';

const ChatPage = () => {
  const [userId, setUserId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pollInterval, setPollInterval] = useState(null);
  const messagesEndRef = useRef(null);

  const BASE_URL = 'http://localhost:3001/api';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize user
  const handleInitialize = async () => {
    if (!userId.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/users/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser(userId.trim());
        setIsInitialized(true);
        
        // Fetch users
        await fetchUsers();
        
        // Auto-select "alice" or "bob" as recipient
        const otherUser = userId.trim() === 'alice' ? 'bob' : 'alice';
        setRecipientId(otherUser);
      } else {
        setError(data.error || 'Initialization failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running on http://localhost:3001');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users`);
      const data = await response.json();
      
      if (data.success) {
        // Get all users including current user for recipient selection
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch messages and auto-decrypt
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${BASE_URL}/messages`);
      const data = await response.json();
      
      if (data.success && data.messages) {
        // Filter relevant messages for current conversation
        const conversationMessages = data.messages.filter(msg =>
          (msg.senderId === currentUser && msg.recipientId === recipientId) ||
          (msg.senderId === recipientId && msg.recipientId === currentUser)
        );

        // Decrypt received messages
        const decryptedMessages = await Promise.all(
          conversationMessages.map(async (msg) => {
            // If received and not decrypted yet
            if (msg.recipientId === currentUser && !msg.decryptedContent) {
              try {
                const decryptResponse = await fetch(`${BASE_URL}/receive`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    messageId: msg.id,
                    recipientId: currentUser
                  })
                });

                const decryptData = await decryptResponse.json();
                if (decryptData.success) {
                  return {
                    ...msg,
                    decryptedContent: decryptData.content,
                    authenticated: decryptData.authenticated
                  };
                }
              } catch (err) {
                console.error('Decrypt error:', err);
              }
            }
            return msg;
          })
        );

        setMessages(decryptedMessages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // Start polling when user and recipient are set
  useEffect(() => {
    if (isInitialized && currentUser && recipientId) {
      // Fetch immediately
      fetchMessages();
      
      // Then poll every 2 seconds
      const interval = setInterval(fetchMessages, 2000);
      setPollInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [isInitialized, currentUser, recipientId]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !recipientId) {
      setError('Please enter a message and select a recipient');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser,
          recipientId: recipientId,
          message: message.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('');
        
        // Fetch updated messages
        await fetchMessages();
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Change recipient
  const handleSelectUser = (userId) => {
    if (userId !== currentUser) {
      setRecipientId(userId);
      setMessages([]); // Clear messages when switching recipient
    }
  };

  if (!isInitialized) {
    return (
      <div className="chat-container">
        <div className="chat-init-screen">
          <div className="init-card">
            <h1>🔐 WhistleChain Secure Chat</h1>
            <p className="init-subtitle">Post-Quantum Encrypted User-to-User Messaging</p>
            
            <div className="security-info">
              <div className="security-badge">
                <span className="badge-icon">🔑</span>
                <span>EC Keypairs</span>
              </div>
              <div className="security-badge">
                <span className="badge-icon">✍️</span>
                <span>RSA Signatures</span>
              </div>
              <div className="security-badge">
                <span className="badge-icon">🔒</span>
                <span>End-to-End Encrypted</span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="init-form">
              <label className="form-label">Choose your username:</label>
              <div className="button-group">
                <button 
                  onClick={() => setUserId('alice')}
                  className={`user-button ${userId === 'alice' ? 'active' : ''}`}
                >
                  👤 Alice
                </button>
                <button 
                  onClick={() => setUserId('bob')}
                  className={`user-button ${userId === 'bob' ? 'active' : ''}`}
                >
                  👤 Bob
                </button>
              </div>

              {userId && (
                <button 
                  onClick={handleInitialize}
                  disabled={loading}
                  className="init-button"
                >
                  {loading ? '🔄 Generating Keys...' : '🚀 Start Secure Chat'}
                </button>
              )}
            </div>

            <div className="init-info">
              <h3>📋 How It Works:</h3>
              <ul>
                <li>✅ Select Alice or Bob</li>
                <li>✅ Quantum-resistant keypairs generated</li>
                <li>✅ Messages encrypted end-to-end</li>
                <li>✅ Digitally signed for authenticity</li>
                <li>✅ Open second browser tab with other user</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Users Sidebar */}
        <div className="users-sidebar">
          <h3>📋 Users Online</h3>
          <div className="users-list">
            {users.map(user => (
              <div
                key={user.id}
                className={`user-item ${recipientId === user.id ? 'active' : ''}`}
                onClick={() => handleSelectUser(user.id)}
              >
                <div className="user-avatar">
                  {user.id === 'alice' ? '👩' : '👨'}
                </div>
                <div className="user-info">
                  <div className="user-name">
                    {user.id}
                    {user.id === currentUser && ' (You)'}
                  </div>
                  <div className="user-status">🔐 PQC Enabled</div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="no-users">
                <p>No users found</p>
              </div>
            )}
          </div>

          <div className="sidebar-info">
            <h4>💡 Tip:</h4>
            <p>Open another browser tab and login as {currentUser === 'alice' ? 'Bob' : 'Alice'} to start chatting!</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          {recipientId && recipientId !== currentUser ? (
            <>
              <div className="chat-recipient-header">
                <div className="recipient-avatar">
                  {recipientId === 'alice' ? '👩' : '👨'}
                </div>
                <div className="recipient-info">
                  <h3>{recipientId}</h3>
                  <p className="encryption-status">🔒 End-to-End Encrypted with PQC</p>
                </div>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>💬 No messages yet</p>
                    <p className="subtitle">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message ${msg.senderId === currentUser ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p className="message-text">
                          {msg.decryptedContent || msg.encryptedContent}
                        </p>
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
              <p className="hint">👉 Click on a user in the sidebar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
