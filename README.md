
# WhistleChain — Quantum-Secure Whistleblower Platform

> End-to-end encrypted, blockchain-verified, and post-quantum resistant submission platform for whistleblowers and journalists.

---

## Introduction

WhistleChain is a next-generation whistleblower submission platform designed to protect truth-tellers in the post-quantum era.  
Unlike existing tools such as Signal, Tor, or SecureDrop — which remain vulnerable to quantum attacks and lack verifiable proof of submission — WhistleChain ensures confidentiality, authenticity, and immutability through post-quantum cryptography and blockchain integration.

---

## Overview

Edward Snowden had to physically carry encrypted drives across borders to deliver leaks securely.  
Today, even strong systems like Signal and Tor rely on classical encryption that could be broken by quantum computers.  
WhistleChain solves these challenges by combining quantum-safe cryptography with decentralized verification — ensuring both privacy and proof of integrity.

---

## Core Features

| Feature | Description |
|----------|-------------|
| **Post-Quantum Encryption** | Uses Kyber-768 (CRYSTALS-Kyber) for key exchange and Dilithium for digital signatures — both NIST-selected PQC algorithms. |
| **End-to-End Encryption** | File content is encrypted using AES-256-GCM, providing authenticated encryption and integrity verification. |
| **Tamper-Proof Fingerprint** | Generates a SHA-256 hash of every encrypted submission — creating a unique, immutable digital fingerprint. |
| **Blockchain Verification** | Each hash is stored on the Polygon Blockchain, offering a permanent, decentralized proof-of-submission without relying on any central server. |
| **Anonymous Authentication** | Dilithium signatures verify the sender’s legitimacy without revealing identity, supporting repeat whistleblower reputation. |
| **Forward Secrecy** | Every submission uses ephemeral post-quantum keys, ensuring that even future key compromises cannot decrypt past submissions. |
| **Reputation System** | Builds trust for recurring anonymous sources using cryptographic proofs — enabling credibility without deanonymization. |

---


---

## Cryptographic Stack

| Layer | Algorithm | Purpose |
|--------|------------|----------|
| **Symmetric Encryption** | AES-256-GCM | Encrypts file content |
| **Key Exchange** | Kyber-768 | Quantum-safe key generation and distribution |
| **Digital Signature** | Dilithium | Post-quantum identity proof and message authenticity |
| **Hashing** | SHA-256 | File integrity and blockchain proof |
| **Blockchain** | Polygon | Immutable storage of hash for public verification |

---

## Tech Stack

- **Frontend:** React  
- **Backend:** Node.js / Express  
- **Cryptography:** Kyber-768, Dilithium, AES-256-GCM  
- **Blockchain:** Polygon  

---

## Vision

WhistleChain redefines digital whistleblowing by ensuring:

- Quantum resistance  
- Immutable integrity  
- Zero-trust architecture  
- Anonymous credibility  

WhistleChain empowers whistleblowers to share critical truths safely — even in a post-quantum world.


