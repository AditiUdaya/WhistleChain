// chat.js
import fetch from "node-fetch";
import readline from "readline";

const API = "http://10.238.175.41:3000";

// 🧠 Set your identity manually here
const username = "bob";     // change to "bob" in the second terminal
const receiver = username === "alice" ? "bob" : "alice";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// Poll messages periodically
async function pollMessages() {
  try {
    const res = await fetch(`${API}/receive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiver: username }),
    });
    const msgs = await res.json();

    for (const msg of msgs) {
      if (msg.verified && msg.message) {
        console.log(`\n📥 ${msg.from} → ${username}: ${msg.message}`);
      } else if (msg.error) {
        console.log(`\n⚠️ Message error: ${msg.error}`);
      }
    }
  } catch (e) {
    console.log("⚠️ Poll error:", e.message);
  }
}

// Send message
async function sendMessage(text) {
  try {
    const res = await fetch(`${API}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: username, receiver, message: text }),
    });
    const data = await res.json();
    if (data.status === "sent") {
      console.log(`📤 ${username} → ${receiver}: ${text}`);
    } else {
      console.log(`⚠️ Send failed: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    console.log("⚠️ Send error:", e.message);
  }
}

// Start chat
async function main() {
  console.log(`🔗 Connected as ${username} | Chatting with ${receiver}\n`);
  console.log("💬 Type your message and press Enter to send.\n");

  // Poll messages every 4 seconds
  setInterval(pollMessages, 4000);

  // Read user input
  rl.on("line", async (input) => {
    if (input.trim().length > 0) {
      await sendMessage(input.trim());
    }
  });
}

main();
