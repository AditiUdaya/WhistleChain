// server.js
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import {
  generateSigKeypair,
  generateKemKeypair,
  authenticatedEncapsulate,
  authenticatedDecapsulate,
  deriveAESKey,
} from "./crypto/kyber.js";
import { encryptAES, decryptAES } from "./crypto/aes.js";
import { recordLeakHash } from "../blockchain/contracts/recordLeak.js";  // ✅ blockchain function

const app = express();
app.use(bodyParser.json());

/* ------------------ File setup ------------------ */
const cryptoDir = "./crypto";
const userKeysPath = `${cryptoDir}/userKeys.json`;

if (!fs.existsSync(cryptoDir)) fs.mkdirSync(cryptoDir, { recursive: true });

// ✅ Initialize userKeys.json if missing
if (!fs.existsSync(userKeysPath)) {
  fs.writeFileSync(
    userKeysPath,
    JSON.stringify({ alice: {}, bob: {} }, null, 2)
  );
  console.log("🧩 Created new userKeys.json file with placeholders");
}

// Load userKeys
const userKeys = JSON.parse(fs.readFileSync(userKeysPath, "utf8"));
let messages = [];

/* ------------------ Initialization (PERSISTENT keys) ------------------ */
/**
 * Only generate keypairs if they are missing for a user.
 * This prevents key rotation on every server start.
 */
let changed = false;
for (const user of Object.keys(userKeys)) {
  const u = userKeys[user] || {};

  const hasKem = u.kemPublicKey && u.kemSecretKey;
  const hasSig = u.sigPublicKey && u.sigSecretKey;

  if (hasKem && hasSig) {
    // keys already present, keep them
    continue;
  }

  // generate missing keys
  const sigKeys = generateSigKeypair();
  const kemKeys = generateKemKeypair();

  userKeys[user] = {
    ...userKeys[user],
    sigPublicKey: Buffer.from(sigKeys.publicKey).toString("base64"),
    sigSecretKey: Buffer.from(sigKeys.secretKey).toString("base64"),
    kemPublicKey: Buffer.from(kemKeys.publicKey).toString("base64"),
    kemSecretKey: Buffer.from(kemKeys.secretKey).toString("base64"),
  };

  changed = true;
}

// persist only if we created any keys
if (changed) {
  fs.writeFileSync(userKeysPath, JSON.stringify(userKeys, null, 2));
  console.log("✅ Generated & saved missing user keys to:", userKeysPath);
} else {
  console.log("✅ Loaded existing user keys (no regeneration).");
}

/* ------------------ Routes ------------------ */

// 1️⃣ Get user public keys
app.get("/publicKey/:user", (req, res) => {
  const u = req.params.user;
  const k = userKeys[u];
  if (!k) return res.status(404).json({ error: "User not found" });

  res.json({
    kemPublicKey: k.kemPublicKey,
    sigPublicKey: k.sigPublicKey,
  });
});

// 2️⃣ Send PQC-secured message
app.post("/send", (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    if (!sender || !receiver || !message)
      return res.status(400).json({ error: "sender, receiver, message required" });

    const receiverKemPk = Buffer.from(userKeys[receiver].kemPublicKey, "base64");
    const senderSigSk = Buffer.from(userKeys[sender].sigSecretKey, "base64");

    const akem = authenticatedEncapsulate(new Uint8Array(receiverKemPk), senderSigSk);

    if (!akem.sharedSecret)
      return res.status(500).json({ error: "Encapsulation failed — no sharedSecret" });

    const sharedSecretBuf = Buffer.isBuffer(akem.sharedSecret)
      ? akem.sharedSecret
      : Buffer.from(akem.sharedSecret);

    const aesKey = deriveAESKey(sharedSecretBuf);
    const encrypted = encryptAES(aesKey, message);

    messages.push({
      id: Date.now(),
      sender,
      receiver,
      signerPub: Buffer.from(akem.signerPub).toString("base64"),
      cipherText: Buffer.from(akem.cipherText).toString("base64"),
      signature: Buffer.from(akem.signature).toString("base64"),
      iv: encrypted.iv,
      ciphertext: encrypted.ciphertext,
    });

    return res.json({ status: "sent" });
  } catch (err) {
    console.error("SEND route error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// 3️⃣ Receive PQC message
app.post("/receive", (req, res) => {
  const { receiver } = req.body;
  const inbox = messages.filter((m) => m.receiver === receiver);
  messages = messages.filter((m) => m.receiver !== receiver);

  const results = [];
  const receiverKemSk = Buffer.from(userKeys[receiver].kemSecretKey, "base64");

  for (const msg of inbox) {
    const senderSigPk = Buffer.from(userKeys[msg.sender].sigPublicKey, "base64");

    try {
      const sharedSecret = authenticatedDecapsulate(
        Buffer.from(msg.signerPub, "base64"),
        Buffer.from(msg.cipherText, "base64"),
        Buffer.from(msg.signature, "base64"),
        senderSigPk,
        receiverKemSk
      );

      const aesKey = deriveAESKey(sharedSecret);
      const plain = decryptAES(aesKey, msg.iv, msg.ciphertext);

      results.push({ from: msg.sender, verified: true, message: plain });
    } catch (err) {
      results.push({ from: msg.sender, verified: false, error: err.message });
    }
  }

  res.json(results);
});

/* ------------------ Leak Submission System ------------------ */

const upload = multer({ dest: "uploads/tmp/" });
const encryptedDir = "uploads/encrypted";
if (!fs.existsSync(encryptedDir)) fs.mkdirSync(encryptedDir, { recursive: true });

// 4️⃣ Upload + Blockchain record
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    if (!sender || !receiver)
      return res.status(400).json({ error: "Sender and receiver required" });

    const receiverKemPk = Buffer.from(userKeys[receiver].kemPublicKey, "base64");
    const senderSigSk = Buffer.from(userKeys[sender].sigSecretKey, "base64");

    const fileData = fs.readFileSync(req.file.path);

    // PQC Encryption
    const akem = authenticatedEncapsulate(receiverKemPk, senderSigSk);
    // debug: log server sharedSecret hash (optional)
    console.log("SERVER sharedSecret hash:",
      crypto.createHash("sha256").update(Buffer.from(akem.sharedSecret)).digest("hex"));

    const aesKey = deriveAESKey(Buffer.from(akem.sharedSecret));
    const encrypted = encryptAES(aesKey, fileData);

    // Blockchain hash
    const hash = crypto.createHash("sha256").update(Buffer.from(encrypted.ciphertext, "base64")).digest("hex");
    const tx = await recordLeakHash(hash);

    // Save encrypted file
    const encFileName = `${Date.now()}-${req.file.originalname}.enc`;
    const encPath = path.join(encryptedDir, encFileName);

    // Save encrypted payload (iv + ciphertext)
    fs.writeFileSync(
      encPath,
      JSON.stringify({
        iv: encrypted.iv, // base64 string
        ciphertext: encrypted.ciphertext, // base64 (ciphertext + tag)
      })
    );

    const meta = {
      file_id: encFileName,
      original_name: req.file.originalname,
      signerPub: Buffer.from(akem.signerPub).toString("base64"),
      kemCipherText: Buffer.from(akem.cipherText).toString("base64"),
      signature: Buffer.from(akem.signature).toString("base64"),
      senderSigPublicKey: userKeys[sender].sigPublicKey, // base64
      hash, // the SHA256 hex recorded on-chain
      txHash: tx ? tx.transactionHash : null,
    };
    fs.writeFileSync(`${encPath}.meta.json`, JSON.stringify(meta, null, 2));

    res.json({
      status: "Leak stored securely ✅",
      hash,
      txLink: tx ? `https://amoy.polygonscan.com/tx/${tx.transactionHash}` : null,
      file_id: encFileName,
    });
  } catch (err) {
    console.error("❌ Leak upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5️⃣ Download metadata for a file
app.get("/metadata/:id", (req, res) => {
  const metaPath = path.join(encryptedDir, `${req.params.id}.meta.json`);
  if (!fs.existsSync(metaPath)) {
    return res.status(404).json({ error: "Metadata not found" });
  }
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  res.json(meta);
});

// 6️⃣ Download encrypted file
app.get("/download/:id", (req, res) => {
  const filePath = path.join(encryptedDir, req.params.id);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
  res.download(filePath);
});

/* ------------------ Start Server ------------------ */
app.listen(3000, () => {
  console.log("🚀 PQC Messaging + Leak Server running on http://localhost:3000");
  console.log("🔐 Kyber768 + ML-DSA65 + AES-256-GCM + Blockchain Proof");
});
