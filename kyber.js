// verify-signed-encap.js
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { randomBytes } from '@noble/post-quantum/utils.js';
import crypto from 'crypto';

const seed = randomBytes(32);

// Long-term signing keys (Alice has a signing key pair; Bob has one too)
const aliceSigKeys = ml_dsa65.keygen(seed);      // in real use: persist/load
const bobSigKeys   = ml_dsa65.keygen(randomBytes(32));

// Ephemeral KEM keys
const aliceKem = ml_kem768.keygen(randomBytes(64));
const bobKem   = ml_kem768.keygen(randomBytes(64));

// Alice encapsulates to Bob's KEM public key
const { cipherText, sharedSecret: aliceShared } = ml_kem768.encapsulate(bobKem.publicKey);

// Alice builds a message to sign: aliceKem.publicKey || cipherText
const payload = Buffer.concat([Buffer.from(aliceKem.publicKey), Buffer.from(cipherText)]);

// SIGN (note: your ml_dsa65 API expects (msg, secretKey) per your environment)
const sig = ml_dsa65.sign(payload, aliceSigKeys.secretKey);

// Now send to Bob: { aliceKem.publicKey, cipherText, sig, signerPub = aliceSigKeys.publicKey }

// Bob verifies signature before decapsulating
const verified = ml_dsa65.verify(sig, payload, aliceSigKeys.publicKey);

if (!verified) {
  console.error('Signature verification failed — abort (possible MITM)');
  process.exit(1);
}
console.log('Signature verified — proceeding to decapsulate');

// Bob decapsulates using alice's (ephemeral) cipherText and his secret key
const bobShared = ml_kem768.decapsulate(cipherText, bobKem.secretKey);

// Now compare secrets (timing safe)
const a = Buffer.from(aliceShared);
const b = Buffer.from(bobShared);

if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
  console.log(' Authenticated KEM succeeded — shared secret match');
} else {
  console.error(' Authenticated KEM failed — shared secret mismatch');
}
