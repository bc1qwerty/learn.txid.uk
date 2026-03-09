---
title: "Mempool — Bitcoin Transaction Waiting Room"
date: 2026-03-02
tags: ["Bitcoin"]
description: "Mempool is a space where unconfirmed transactions that have not yet been included in a block wait."
levels: "입문"
weight: 26
---

**Mempool (Memory Pool)** is a space where unconfirmed transactions that have not yet been included in a block wait.

Each Bitcoin node maintains its own mempool. When a user sends a transaction:
1. The node validates it (signature, balance check)
2. If valid, it adds it to the mempool and broadcasts it to other nodes
3. Miners select transactions from the mempool in order of highest fees and include them in blocks

What the mempool teaches us:
- **Fee Market**: Block space is limited, so fee competition occurs. This is a real example of free market price formation
- **Network Congestion**: You can understand the current network state by the mempool size
- **Censorship Resistance**: Since multiple miners compete, it is difficult to permanently block specific transactions

## Related Concepts

- [Node](/ideas/node/) — Bitcoin network participants that maintain mempool, validate and broadcast transactions
- [Proof of Work](/ideas/proof-of-work/) — Consensus mechanism where miners select transactions from the mempool to create blocks
- [What is Bitcoin?](/start/bitcoin/) — Starting point introducing the basic concepts and how Bitcoin works