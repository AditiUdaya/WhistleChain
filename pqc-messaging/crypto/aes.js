// crypto/aes.js
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export function encryptAES(key, plaintext) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    ciphertext: Buffer.concat([ciphertext, tag]).toString('base64'),
  };
}

export function decryptAES(key, iv_b64, ciphertext_b64) {
  const iv = Buffer.from(iv_b64, 'base64');
  const data = Buffer.from(ciphertext_b64, 'base64');
  const tag = data.slice(data.length - 16);
  const ciphertext = data.slice(0, data.length - 16);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}
