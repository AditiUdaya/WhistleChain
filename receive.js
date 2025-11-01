// receive.js
import fetch from "node-fetch";

const API = "http://localhost:3000";
const receiver = "bob";

async function receiveMessages() {
  try {
    const res = await fetch(`${API}/receive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiver }),
    });

    const data = await res.json();

    console.log("\n📥 Incoming messages for", receiver);
    console.log("---------------------------------------");

    if (data.length === 0) return console.log("No messages yet 💤");

    for (const msg of data) {
      if (msg.error) console.log("⚠️  Error:", msg.error);
      else console.log(`🧩 From: ${msg.from}\n💬 Message: ${msg.message}\n✅ Verified: ${msg.verified}\n`);
    }
  } catch (err) {
    console.error("❌ Error receiving:", err.message);
  }
}

receiveMessages();
