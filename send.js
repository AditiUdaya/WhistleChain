// send.js
import fetch from "node-fetch";

const API = "http://localhost:3000";

const sender = "alice";
const receiver = "bob";
const message = "Quantum-safe hello, Bob! 🕵️‍♀️";

async function sendMessage() {
  try {
    const res = await fetch(`${API}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, receiver, message }),
    });

    const data = await res.json();
    console.log("📤 Sent:", message);
    console.log("🔐 Server Response:", data);
  } catch (err) {
    console.error("❌ Error sending:", err.message);
  }
}

sendMessage();
