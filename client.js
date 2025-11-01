// Test client for PQC Messaging System
const BASE_URL = 'http://localhost:3000/api';

async function initializeUsers() {
  console.log('\n📝 Step 1: Initializing users...\n');

  const users = ['alice', 'bob'];

  for (const userId of users) {
    
    const response = await fetch(`${BASE_URL}/users/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    const data = await response.json();
    console.log(`✅ ${userId} initialized`);
    console.log(`   KEM Public Key (first 32 chars): ${data.publicKeys.kemPublicKey.substring(0, 32)}...`);
    console.log(`   SIG Public Key (first 32 chars): ${data.publicKeys.sigPublicKey.substring(0, 32)}...\n`);
  }
}

async function getAllUsers() {
  console.log('\n📋 Step 2: Getting all users...\n');

  const response = await fetch(`${BASE_URL}/users`);
  const data = await response.json();

  console.log(`Total users: ${data.totalUsers}`);
  data.users.forEach(user => {
    console.log(`  - ${user.id}`);
  });
  console.log('');
}

async function sendSecureMessage() {
  console.log('\n📤 Step 3: Alice sends encrypted & signed message to Bob...\n');

  const response = await fetch(`${BASE_URL}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderId: 'alice',
      recipientId: 'bob',
      message: 'Hello Bob! This is a quantum-safe message from Alice. 🔐🚀'
    })
  });

  const data = await response.json();
  console.log(`✅ Message sent successfully!`);
  console.log(`   Message ID: ${data.messageId}`);
  console.log(`   From: ${data.senderId}`);
  console.log(`   To: ${data.recipientId}`);
  console.log(`   Timestamp: ${data.timestamp}\n`);

  return data.messageId;
}

async function receiveSecureMessage(messageId) {
  console.log('\n📨 Step 4: Bob receives and decrypts message...\n');

  const response = await fetch(`${BASE_URL}/receive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messageId,
      recipientId: 'bob'
    })
  });

  const data = await response.json();

  if (data.success) {
    console.log(`✅ Message verified and decrypted!`);
    console.log(`   Message ID: ${data.messageId}`);
    console.log(`   From: ${data.senderId}`);
    console.log(`   Content: "${data.content}"`);
    console.log(`   Signature Verified: ${data.signatureVerified} ✍️`);
    console.log(`   Authenticated: ${data.authenticated} 🔒\n`);
  } else {
    console.error(`❌ Failed to receive message: ${data.error}\n`);
  }
}

async function getAllMessages() {
  console.log('\n📬 Step 5: Viewing all messages (encrypted)...\n');

  const response = await fetch(`${BASE_URL}/messages`);
  const data = await response.json();

  console.log(`Total messages: ${data.totalMessages}`);
  data.messages.forEach(msg => {
    console.log(`  ID: ${msg.id} | ${msg.senderId} → ${msg.recipientId} | Auth: ${msg.authenticated}`);
  });
  console.log('');
}

async function getStats() {
  console.log('\n📊 Step 6: Getting statistics...\n');

  const response = await fetch(`${BASE_URL}/stats`);
  const data = await response.json();

  console.log('Messaging Stats:');
  console.log(`  Total Users: ${data.totalUsers}`);
  console.log(`  Total Messages: ${data.totalMessages}`);
  console.log(`  Authenticated Messages: ${data.authenticatedMessages}\n`);
  console.log('Security Configuration:');
  console.log(`  Key Exchange: ${data.security.keyExchange}`);
  console.log(`  Signature Algorithm: ${data.security.signature}`);
  console.log(`  Message Encryption: ${data.security.encryption}`);
  console.log(`  Post-Quantum Safe: ${data.security.postQuantumSafe} ✅\n`);
}

async function fullDemo() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 PQC SECURE MESSAGING SYSTEM DEMO');
  console.log('='.repeat(70));

  try {
    await initializeUsers();
    await getAllUsers();
    const messageId = await sendSecureMessage();
    await receiveSecureMessage(messageId);
    await getAllMessages();
    await getStats();

    console.log('='.repeat(70));
    console.log('✅ DEMO COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('❌ Error during demo:', error.message);
  }
}

// Run the demo
fullDemo();