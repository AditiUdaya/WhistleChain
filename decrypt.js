// decrypt.js
// Usage:
//  node decrypt.js <file_id> <receiver_username> [server_base_url]
// Example:
//  node decrypt.js 1761996662058-file.txt.enc bob http://localhost:3000

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import crypto from "crypto";
import { authenticatedDecapsulate, deriveAESKey } from "./crypto/kyber.js";
import { decryptAES } from "./crypto/aes.js";

const [,, fileId, receiver, baseUrl = "http://localhost:3000"] = process.argv;
if (!fileId || !receiver) {
  console.error("Usage: node decrypt.js <file_id> <receiver> [server_base_url]");
  process.exit(1);
}

function toBufferFromPossible(value, name = "") {
  // Accept base64 string, array of numbers, Buffer-like, or object with data[]
  if (!value && value !== 0) throw new Error(`${name} is missing or empty`);
  if (typeof value === "string") {
    // likely base64
    try {
      return Buffer.from(value, "base64");
    } catch (e) {
      throw new Error(`${name} string couldn't be parsed as base64`);
    }
  }
  if (Buffer.isBuffer(value)) return value;
  if (Array.isArray(value)) return Buffer.from(value);
  // some libraries stringify Uint8Array to object like { '0': 1, '1': 2, length: 2 } — handle common cases:
  if (typeof value === "object") {
    // try if it's a plain object with numeric keys
    const keys = Object.keys(value).filter(k => /^[0-9]+$/.test(k)).sort((a,b)=>a-b);
    if (keys.length > 0) {
      const arr = keys.map(k => Number(value[k]));
      return Buffer.from(arr);
    }
  }
  throw new Error(`${name} has unsupported format (${typeof value})`);
}

async function run() {
  try {
    // 1) Download encrypted file if not present locally
    const encLocalPath = path.join("uploads", "encrypted", fileId);
    if (!fs.existsSync(encLocalPath)) {
      console.log("Downloading encrypted file:", `${baseUrl}/download/${fileId}`);
      const r = await fetch(`${baseUrl}/download/${fileId}`);
      if (!r.ok) throw new Error("Failed to download encrypted file");
      const data = await r.text(); // file stored as JSON
      fs.mkdirSync(path.dirname(encLocalPath), { recursive: true });
      fs.writeFileSync(encLocalPath, data, "utf8");
      console.log("Saved encrypted file to", encLocalPath);
    } else {
      console.log("Using local encrypted file:", encLocalPath);
    }

    // 2) Download metadata
    console.log("Fetching metadata:", `${baseUrl}/metadata/${fileId}`);
    const metaRes = await fetch(`${baseUrl}/metadata/${fileId}`);
    if (!metaRes.ok) throw new Error("Failed to fetch metadata; ensure server saved metadata");
    const meta = await metaRes.json();

    // 3) Read encrypted payload
    const encJson = JSON.parse(fs.readFileSync(encLocalPath, "utf8"));
    // Normalize iv into Buffer
    const iv = toBufferFromPossible(encJson.iv, "IV");
    const ciphertext = Buffer.from(encJson.ciphertext, "base64");

    console.log("🔍 iv length:", iv.length, "ciphertext length:", ciphertext.length);

    // 4) Load receiver's Kyber secret key (you must have this locally)
    const userKeys = JSON.parse(fs.readFileSync("./crypto/userKeys.json", "utf8"));
    const receiverKemSecretBase64 = userKeys[receiver]?.kemSecretKey;
    if (!receiverKemSecretBase64) throw new Error("Receiver kemSecretKey not found in ./crypto/userKeys.json. Copy receiver's secret key locally for testing.");
    const receiverKemSk = Buffer.from(receiverKemSecretBase64, "base64");

    // 5) Prepare metadata values as Buffers
    const aliceEphemeralPub = Buffer.from(meta.signerPub, "base64");       // signerPub (ephemeral pubkey)
    const kemCipherText = Buffer.from(meta.kemCipherText, "base64");       // KEM ciphertext
    const signature = Buffer.from(meta.signature, "base64");               // signature bytes
    const senderSigPub = Buffer.from(meta.senderSigPublicKey, "base64");   // sender's signature public key

    console.log("🔍 metadata lengths — signerPub:", aliceEphemeralPub.length,
                "kemCipherText:", kemCipherText.length,
                "signature:", signature.length,
                "senderSigPub:", senderSigPub.length);

    // 6) Perform authenticated decapsulation to get sharedSecret
    let sharedSecret;
    try {
      sharedSecret = authenticatedDecapsulate(
        aliceEphemeralPub,
        kemCipherText,
        signature,
        senderSigPub,
        receiverKemSk
      );
    } catch (e) {
      throw new Error("Authenticated decapsulation failed: " + e.message);
    }

    if (!sharedSecret || sharedSecret.length === 0) throw new Error("Decapsulation returned empty sharedSecret");
    console.log("🔍 sharedSecret length:", sharedSecret.length);

    // 7) Derive AES key and decrypt
    console.log("CLIENT sharedSecret hash:",
  crypto.createHash("sha256").update(sharedSecret).digest("hex"));
    const aesKey = deriveAESKey(sharedSecret);
    console.log("🔍 AES key length:", aesKey.length);

    let decrypted;
    try {
      decrypted = decryptAES(aesKey, iv, ciphertext);
    } catch (e) {
      throw new Error("AES-GCM decryption failed (auth tag mismatch or wrong key/iv): " + e.message);
    }

    // 8) Write plaintext file (strip .enc)
    const outPath = encLocalPath.replace(/\.enc$/, "");
    fs.writeFileSync(outPath, decrypted);
    console.log("✅ Decrypted file saved to:", outPath);

    // 9) Optional: verify hash against meta.hash
    if (meta.hash) {
      const hashLocal = crypto.createHash("sha256").update(ciphertext).digest("hex");
      console.log("Local encrypted-file SHA256:", hashLocal);
      console.log("Meta hash:", meta.hash);
      console.log("Match:", hashLocal === meta.hash);
    }
  } catch (err) {
    console.error("Decrypt error:", err.message);
    process.exit(1);
  }
}

run();
