---
title: "Lightning Network — Bitcoin's Layer 2"
date: 2026-03-11
tags: ["Bitcoin"]
description: "The Lightning Network is a layer 2 payment network built on top of the Bitcoin blockchain, enabling small instant payments."
levels: "입문"
weight: 25
---

**The Lightning Network** is a layer 2 payment network built on top of the Bitcoin blockchain, enabling small instant payments.

How it works:
1. Two users open a **payment channel** with an on-chain transaction
2. They exchange unlimited instant transactions within the channel (no on-chain recording needed)
3. When closing the channel, only the final balance is recorded on-chain

Advantages of Lightning:
- **Speed**: Instant payments in milliseconds
- **Fees**: Extremely low fees under 1 sat
- **Scalability**: Can process millions of transactions per second
- **Privacy**: Intermediate routing transactions are not recorded on-chain

Bitcoin's base layer serves as the final settlement layer (vault), while Lightning serves as the everyday payment layer (wallet). This is similar to the relationship between gold (settlement) and paper currency (everyday transactions) in the gold standard.

## Related Concepts

- [SegWit](/ideas/segwit/) — The Bitcoin protocol upgrade that enabled the Lightning Network
- [Node](/ideas/node/) — Participants in the Bitcoin network who validate transactions and blocks
- [What is Bitcoin?](/start/bitcoin/) — A starting point introducing Bitcoin's basic concepts and how it works