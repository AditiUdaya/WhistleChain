import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { randomBytes } from '@noble/post-quantum/utils.js';
import crypto from 'crypto';

export class SecureMessaging {
  constructor() {
    this.users = new Map();
    this.messages = [];
    this.userKeys = new Map(); // Store user KEM and signing keys
  }

  // Initialize user with PQC keypairs
  initializeUser(userId) {
    if (this.userKeys.has(userId)) {
      return this.userKeys.get(userId);
    }

    const seed = randomBytes(32);
    const kemKeys = ml_kem768.keygen(randomBytes(64));
    const sigKeys = ml_dsa65.keygen(seed);

    const userKeyPair = {
      userId,
      kem: kemKeys,
      sig: sigKeys,
      createdAt: new Date().toISOString()
    };

    this.userKeys.set(userId, userKeyPair);
    this.users.set(userId, { 
      id: userId,
      kemPublicKey: Buffer.from(kemKeys.publicKey).toString('hex'),
      sigPublicKey: Buffer.from(sigKeys.publicKey).toString('hex')
    });

    console.log(`🔐 User initialized: ${userId}`);
    return userKeyPair;
  }

  // Encrypt message using recipient's KEM public key
  encryptMessage(messageText, recipientKeyPair) {
    try {
      const messageBuffer = Buffer.from(messageText, 'utf-8');

      // Encapsulate shared secret
      const { cipherText, sharedSecret } = ml_kem768.encapsulate(recipientKeyPair.kem.publicKey);

      // Derive encryption key from shared secret
      const encKey = crypto.createHmac('sha256', Buffer.from(sharedSecret))
        .update('encryption')
        .digest();

      // Encrypt message with AES-256-GCM
      const iv = randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', encKey, iv);
      const encrypted = Buffer.concat([
        cipher.update(messageBuffer),
        cipher.final()
      ]);
      const authTag = cipher.getAuthTag();

      return {
        cipherText: Buffer.from(cipherText).toString('hex'),
        encryptedMessage: encrypted.toString('hex'),
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        sharedSecret: Buffer.from(sharedSecret).toString('hex')
      };
    } catch (error) {
      console.error('❌ Encryption error:', error.message);
      throw error;
    }
  }

  // Decrypt message using recipient's KEM secret key
  decryptMessage(encryptedData, recipientKeyPair) {
    try {
      const cipherText = Buffer.from(encryptedData.cipherText, 'hex');
      const encryptedMessage = Buffer.from(encryptedData.encryptedMessage, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');

      // Decapsulate shared secret
      const sharedSecret = ml_kem768.decapsulate(cipherText, recipientKeyPair.kem.secretKey);

      // Derive decryption key from shared secret
      const decKey = crypto.createHmac('sha256', Buffer.from(sharedSecret))
        .update('encryption')
        .digest();

      // Decrypt message
      const decipher = crypto.createDecipheriv('aes-256-gcm', decKey, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([
        decipher.update(encryptedMessage),
        decipher.final()
      ]);

      return decrypted.toString('utf-8');
    } catch (error) {
      console.error('❌ Decryption error:', error.message);
      throw error;
    }
  }

  // Sign and send message with authentication
  sendMessage(senderId, recipientId, messageText) {
    try {
      // Initialize users if not exists
      const senderKeyPair = this.initializeUser(senderId);
      const recipientKeyPair = this.initializeUser(recipientId);

      // Encrypt message
      const encryptedData = this.encryptMessage(messageText, recipientKeyPair);

      // Create payload to sign: senderId || recipientId || encryptedData
      const payload = Buffer.concat([
        Buffer.from(senderId, 'utf-8'),
        Buffer.from(recipientId, 'utf-8'),
        Buffer.from(encryptedData.cipherText, 'hex'),
        Buffer.from(encryptedData.encryptedMessage, 'hex')
      ]);

      // Sign payload with sender's ML-DSA key
      const signature = ml_dsa65.sign(payload, senderKeyPair.sig.secretKey);

      const message = {
        id: this.messages.length + 1,
        senderId,
        recipientId,
        encryptedContent: encryptedData.encryptedMessage,
        cipherText: encryptedData.cipherText,
        iv: encryptedData.iv,
        authTag: encryptedData.authTag,
        signature: Buffer.from(signature).toString('hex'),
        senderSigPublicKey: Buffer.from(senderKeyPair.sig.publicKey).toString('hex'),
        timestamp: new Date().toISOString(),
        authenticated: false
      };

      this.messages.push(message);
      console.log(`📤 Message sent: ${senderId} → ${recipientId} (Encrypted & Signed)`);

      return message;
    } catch (error) {
      console.error('❌ Error sending message:', error.message);
      throw error;
    }
  }

  // Verify signature and decrypt message
  receiveMessage(messageId, recipientId) {
    try {
      const message = this.messages.find(m => m.id === messageId);
      if (!message) throw new Error('Message not found');

      if (message.recipientId !== recipientId) {
        throw new Error('Unauthorized: Message not for this recipient');
      }

      // Verify signature
      const payload = Buffer.concat([
        Buffer.from(message.senderId, 'utf-8'),
        Buffer.from(message.recipientId, 'utf-8'),
        Buffer.from(message.cipherText, 'hex'),
        Buffer.from(message.encryptedContent, 'hex')
      ]);

      const signature = Buffer.from(message.signature, 'hex');
      const senderSigPublicKey = Buffer.from(message.senderSigPublicKey, 'hex');

      const isSignatureValid = ml_dsa65.verify(signature, payload, senderSigPublicKey);

      if (!isSignatureValid) {
        throw new Error('❌ Signature verification failed — possible MITM attack');
      }

      // Decrypt message
      const recipientKeyPair = this.userKeys.get(recipientId);
      if (!recipientKeyPair) throw new Error('Recipient keys not found');

      const decryptedContent = this.decryptMessage({
        cipherText: message.cipherText,
        encryptedMessage: message.encryptedContent,
        iv: message.iv,
        authTag: message.authTag
      }, recipientKeyPair);

      // Mark message as authenticated
      message.authenticated = true;

      return {
        success: true,
        messageId: message.id,
        senderId: message.senderId,
        content: decryptedContent,
        timestamp: message.timestamp,
        authenticated: true,
        signatureVerified: isSignatureValid
      };
    } catch (error) {
      console.error('❌ Error receiving message:', error.message);
      return {
        success: false,
        error: error.message,
        authenticated: false
      };
    }
  }

  getMessages() {
    return this.messages;
  }

  getStats() {
    return {
      totalUsers: this.users.size,
      totalMessages: this.messages.length,
      authenticatedMessages: this.messages.filter(m => m.authenticated).length
    };
  }

  getUserPublicKeys(userId) {
    return this.users.get(userId);
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }
}