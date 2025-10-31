import { Web3 } from 'web3';

const web3 = new Web3('https://rpc-amoy.polygon.technology/');

// enter private key here
const privateKey = '0xd...';
const account = web3.eth.accounts.privateKeyToAccount(privateKey);

console.log('🔐 Your address:', account.address);

// Check balance
const balance = await web3.eth.getBalance(account.address);
console.log('💰 Balance:', web3.utils.fromWei(balance, 'ether'), 'MATIC\n');

if (balance == 0n) {
  console.log('❌ No MATIC!');
  process.exit(1);
}

// Get current gas prices
console.log('📤 Preparing transaction...');
const gasPrice = await web3.eth.getGasPrice();

const tx = {
  from: account.address,
  to: account.address,
  value: web3.utils.toWei('0.001', 'ether'),
  gas: 21000,
  gasPrice: gasPrice // Added this!
};

console.log('Signing transaction...');
const signedTx = await account.signTransaction(tx);

console.log('Sending to blockchain...');
const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

console.log('\n✅ Transaction successful!');
console.log('Transaction Hash:', receipt.transactionHash);
console.log('Block Number:', receipt.blockNumber);
console.log('Gas Used:', receipt.gasUsed.toString());
console.log('\nView on PolygonScan:');
console.log(`https://amoy.polygonscan.com/tx/${receipt.transactionHash}`);
