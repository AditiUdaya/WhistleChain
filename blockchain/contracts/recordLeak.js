// blockchain/recordLeak.js
import { Web3 } from "web3";

// ⚠️ Directly use your private key here for local testing only
const PRIVATE_KEY = "0xd..."; // ← replace with your full private key

const web3 = new Web3("https://rpc-amoy.polygon.technology/");
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

console.log("🔐 Using account:", account.address);

export async function recordLeakHash(hash) {
  try {
    const gasPrice = await web3.eth.getGasPrice();

    const tx = {
      from: account.address,
      to: account.address,         // self-transaction
      gas: 50000,
      gasPrice,
      data: web3.utils.toHex(hash) // embed the leak hash
    };

    console.log("📤 Signing transaction...");
    const signed = await account.signTransaction(tx);

    console.log("⛓️  Sending to Polygon...");
    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);

    console.log("✅ Leak hash recorded:", hash);
    console.log("🔗 Polygon tx:", receipt.transactionHash);
    console.log(`🌐 View on PolygonScan: https://amoy.polygonscan.com/tx/${receipt.transactionHash}`);

    return receipt;
  } catch (err) {
    console.error("❌ Blockchain record error:", err.message);
    throw err;
  }
}

// Optional quick test
// (Uncomment to test standalone)
// recordLeakHash("0x" + Buffer.from("Test leak hash").toString("hex"));
