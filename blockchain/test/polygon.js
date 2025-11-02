import { Web3 } from 'web3';

const web3 = new Web3('https://rpc-amoy.polygon.technology/');

console.log('🔗 Testing Polygon Amoy connection...\n');

// Get network info
const chainId = await web3.eth.getChainId();
const blockNumber = await web3.eth.getBlockNumber();
const gasPrice = await web3.eth.getGasPrice();

console.log('✅ Connected to Polygon Amoy!');
console.log('Chain ID:', chainId, '(should be 80002)');
console.log('Current Block:', blockNumber);
console.log('Gas Price:', web3.utils.fromWei(gasPrice, 'gwei'), 'Gwei');
