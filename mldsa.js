import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { randomBytes } from '@noble/post-quantum/utils.js';

// Step 1: Generate keypair
console.log(" Generating ML-DSA65 keypair...");
const seed = randomBytes(32);
const keys = ml_dsa65.keygen(seed);
console.log("Keypair generated!");
console.log("Public key length:", keys.publicKey.length);
console.log("Secret key length:", keys.secretKey.length);

// Step 2: Create message
const msg = new TextEncoder().encode("hello noble");
console.log(" Message:", new TextDecoder().decode(msg));

// Step 3: Sign message
const sig = ml_dsa65.sign(msg, keys.secretKey);
console.log("🖊️ Message signed!");
console.log("Signature length:", sig.length);
console.log("Signature (first 64 hex chars):", Buffer.from(sig).toString("hex").slice(0, 64) + "...");

// Step 4: Verify signature
const isValid = ml_dsa65.verify(sig, msg, keys.publicKey);

if (isValid) {
  console.log(" Signature verified successfully!");
} else {
  console.error(" Signature verification failed!");
}

// Step 5: Print summary
console.log({
  message: new TextDecoder().decode(msg),
  isValid
});
