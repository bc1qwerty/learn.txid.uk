---
title: "Merkle Tree — Efficient Data Verification"
date: 2026-03-10
tags: ["Bitcoin"]
description: "A Merkle tree is a binary hash tree structure that efficiently verifies data integrity by summarizing large amounts of data into a single hash value."
levels: "Beginner"
weight: 27
---

**Merkle Tree** is a binary hash tree structure that efficiently verifies data integrity by summarizing large amounts of data into a single hash value (Merkle root).

How it works in Bitcoin blocks:
1. Hash each transaction
2. Combine adjacent hash pairs and hash them again
3. Repeat this process to eventually obtain a single **Merkle root**
4. This Merkle root is included in the block header

Advantages of Merkle trees:
- **Lightweight verification (SPV)**: You can verify that a specific transaction is included in a block without downloading the entire block
- **Efficiency**: Verifying N transactions requires only log₂(N) hashes
- **Tamper detection**: If any transaction is altered, the Merkle root changes

Invented by Ralph Merkle in 1979, this structure is used not only in Bitcoin but also in various systems like Git and IPFS.

## Related Concepts

- [Proof of Work](/ideas/proof-of-work/) — A consensus mechanism that generates blocks by hashing block headers containing the Merkle root
- [Node](/ideas/node/) — Network participants that verify transaction integrity using Merkle trees
- [What is Bitcoin?](/start/bitcoin/) — A starting point that introduces the basic concepts and how Bitcoin works