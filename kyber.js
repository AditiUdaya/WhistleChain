// crypto/kyber.js
import { ml_kem768 } from "@noble/post-quantum/ml-kem.js";
import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js";
import { randomBytes } from "@noble/post-quantum/utils.js";
import crypto from "crypto";

/* ------------------- Key Generation ------------------- */
export function generateSigKeypair() {
  const { publicKey, secretKey } = ml_dsa65.keygen(randomBytes(32));
  return { publicKey, secretKey };
}

export function generateKemKeypair() {
  const { publicKey, secretKey } = ml_kem768.keygen(randomBytes(64));
  return { publicKey, secretKey };
}

/* ------------------- Utility: Normalize Encapsulation ------------------- */
function extractEncapResult(encRes) {
  const ct =
    encRes.cipherText ??
    encRes.ciphertext ??
    encRes.cipher_text ??
    encRes.cipher;
  const ss =
    encRes.sharedSecret ??
    encRes.sharedsecret ??
    encRes.shared_secret ??
    encRes.shared;
  return { ct, ss, rawKeys: Object.keys(encRes) };
}

/* ------------------- Authenticated Encapsulation ------------------- */
export function authenticatedEncapsulate(receiverPublicKey, senderSigSecretKey) {
  if (!receiverPublicKey) throw new Error("receiverPublicKey is required");

  console.log("authenticatedEncapsulate: receiverPub length=", receiverPublicKey.length);

  // Ephemeral KEM keypair for Alice
  const aliceKem = ml_kem768.keygen(randomBytes(64));

  // Encapsulate to Bob’s public key
  const encRes = ml_kem768.encapsulate(new Uint8Array(receiverPublicKey));

  console.log("encapsulate returned:", encRes);
  console.log("cipherText length:", encRes?.cipherText?.length);
  console.log("sharedSecret value:", encRes?.sharedSecret);

  const { ct, ss, rawKeys } = extractEncapResult(encRes);
  console.log("encapsulate returned fields:", rawKeys);

  if (!ct) throw new Error("Encapsulate did not return ciphertext (ct)");
  if (!ss) throw new Error("Encapsulate did not return sharedSecret (ss)");

  // Sign (aliceKem.publicKey || ciphertext)
  const payload = Buffer.concat([Buffer.from(aliceKem.publicKey), Buffer.from(ct)]);
  const signature = ml_dsa65.sign(payload, senderSigSecretKey);

  return {
    cipherText: ct,
    sharedSecret: ss,
    signature,
    signerPub: aliceKem.publicKey,
  };
}

/* ------------------- Authenticated Decapsulation ------------------- */
export function authenticatedDecapsulate(
  aliceEphemeralPub,
  cipherText,
  signature,
  aliceSigPub,
  bobSecretKey
) {
  if (!aliceEphemeralPub || !cipherText || !signature || !aliceSigPub) {
    throw new Error("Missing argument to authenticatedDecapsulate");
  }

  const payload = Buffer.concat([Buffer.from(aliceEphemeralPub), Buffer.from(cipherText)]);
  const verified = ml_dsa65.verify(signature, payload, aliceSigPub);
  if (!verified) throw new Error("Signature verification failed");

  const sharedSecret = ml_kem768.decapsulate(cipherText, bobSecretKey);
  if (!sharedSecret) throw new Error("Decapsulation produced no sharedSecret");

  return sharedSecret;
}

/* ------------------- AES Key Derivation (HKDF-SHA256) ------------------- */
/*export function deriveAESKey(sharedSecret) {
  if (!sharedSecret)
    throw new Error("deriveAESKey: sharedSecret is null or undefined");

  // Normalize to Buffer
  const ikm = Buffer.isBuffer(sharedSecret)
    ? sharedSecret
    : Buffer.from(sharedSecret);

  // 🔒 Use empty Buffer for salt instead of null
  const salt = Buffer.alloc(0);
  const info = Buffer.from("pqc-chat-v1");

  // ✅ Correct order of args for Node v24:
  // hkdfSync(digest, ikm, salt, info, keylen)
  const key = crypto.hkdfSync("sha256", ikm, salt, info, 32);

  return key;
}
*/
export function deriveAESKey(sharedSecret) {
  if (!sharedSecret) throw new Error("deriveAESKey called with empty sharedSecret");

  // Ensure we operate on a Buffer
  const ikm = Buffer.isBuffer(sharedSecret) ? sharedSecret : Buffer.from(sharedSecret);

  // Use an empty salt buffer (Node v24 requires a Buffer, not null)
  const salt = Buffer.alloc(0);

  const info = Buffer.from("pqc-chat-v1");

  // crypto.hkdfSync(digest, ikm, salt, info, keylen)
  const key = crypto.hkdfSync("sha256", ikm, salt, info, 32);

  // Ensure we return a Buffer
  return Buffer.from(key);
}