import express from 'express';
import cors from 'cors';
import { SecureMessaging } from './messaging.js';

const app = express();
const messaging = new SecureMessaging();

app.use(cors());
app.use(express.json());

// Initialize user with PQC keypairs
app.post('/api/users/init', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const userKeys = messaging.initializeUser(userId);
    const publicKeys = messaging.getUserPublicKeys(userId);

    res.json({
      success: true,
      userId,
      publicKeys,
      message: '✅ User initialized with PQC keypairs'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users and their public keys
app.get('/api/users', (req, res) => {
  try {
    const users = messaging.getAllUsers();
    res.json({
      success: true,
      users,
      totalUsers: users.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific user's public keys
app.get('/api/users/:userId/public-keys', (req, res) => {
  try {
    const { userId } = req.params;
    const publicKeys = messaging.getUserPublicKeys(userId);

    if (!publicKeys) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      userId,
      publicKeys
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send encrypted and signed message
app.post('/api/send', (req, res) => {
  try {
    const { senderId, recipientId, message } = req.body;

    if (!senderId || !recipientId || !message) {
      return res.status(400).json({ error: 'senderId, recipientId, and message required' });
    }

    const sentMessage = messaging.sendMessage(senderId, recipientId, message);

    res.json({
      success: true,
      messageId: sentMessage.id,
      senderId: sentMessage.senderId,
      recipientId: sentMessage.recipientId,
      timestamp: sentMessage.timestamp,
      authenticated: sentMessage.authenticated,
      message: '📤 Message encrypted, signed, and queued'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Receive and decrypt message (verify signature)
app.post('/api/receive', (req, res) => {
  try {
    const { messageId, recipientId } = req.body;

    if (messageId === undefined || !recipientId) {
      return res.status(400).json({ error: 'messageId and recipientId required' });
    }

    const decryptedMessage = messaging.receiveMessage(messageId, recipientId);

    if (!decryptedMessage.success) {
      return res.status(400).json(decryptedMessage);
    }

    res.json(decryptedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all messages (encrypted, for debugging)
app.get('/api/messages', (req, res) => {
  try {
    const messages = messaging.getMessages().map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      timestamp: msg.timestamp,
      authenticated: msg.authenticated,
      encryptedContent: msg.encryptedContent.substring(0, 32) + '...',
      signature: msg.signature.substring(0, 32) + '...'
    }));

    res.json({
      success: true,
      messages,
      totalMessages: messages.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messaging statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = messaging.getStats();
    res.json({
      success: true,
      ...stats,
      security: {
        keyExchange: 'ML-KEM768 (Kyber)',
        signature: 'ML-DSA65',
        encryption: 'AES-256-GCM',
        postQuantumSafe: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'PQC Secure Messaging Server',
    pqc: 'ML-KEM768 + ML-DSA65'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 PQC Messaging Server running on http://localhost:${PORT}`);
  console.log('🔐 Post-Quantum Cryptography enabled');
  console.log('  ├─ Key Exchange: ML-KEM768 (Kyber)');
  console.log('  ├─ Signatures: ML-DSA65');
  console.log('  └─ Encryption: AES-256-GCM');
});