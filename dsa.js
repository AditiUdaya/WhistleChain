// crypto/dsa.js
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';

// Generate Dilithium signing keypair
export function generateSigKeypair() {
  const { publicKey, secretKey } = ml_dsa65.keypair();
  return { publicKey, secretKey };
}

// Sign message with private key
export function signMessage(message, secretKey) {
  const msgBytes = Buffer.from(message, 'utf8');
  const signature = ml_dsa65.sign(msgBytes, secretKey);
  return Buffer.from(signature).toString('base64');
}

// Verify message + signature with public key
export function verifyMessage(message, signature_b64, publicKey) {
  const msgBytes = Buffer.from(message, 'utf8');
  const signature = Buffer.from(signature_b64, 'base64');
  return ml_dsa65.verify(msgBytes, signature, publicKey);
}
