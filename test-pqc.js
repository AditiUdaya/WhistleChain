import { ml_kem768 } from "@noble/post-quantum/ml-kem.js";
import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js";

const kem = ml_kem768.keypair();
const dsa = ml_dsa65.keypair();

console.log("Kyber keypair sizes:", kem.publicKey.length, kem.secretKey.length);
console.log("Dilithium keypair sizes:", dsa.publicKey.length, dsa.secretKey.length);
