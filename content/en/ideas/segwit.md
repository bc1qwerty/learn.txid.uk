---
title: "SegWit (Segregated Witness) — Scaling Through Signature Separation"
date: 2026-03-08
tags: ["Bitcoin"]
description: "SegWit (Segregated Witness) is a Bitcoin protocol upgrade activated in 2017 that increases the practical capacity of blocks by separating signature data from transactions."
levels: "beginner"
weight: 36
---

**SegWit (Segregated Witness)** is a Bitcoin protocol upgrade activated in 2017 that increases the practical capacity of blocks by separating signature data (witness) from transactions.

Before SegWit, signature data was included in transaction ID calculations, which caused the **transaction malleability** problem. A third party could modify signatures to change the transaction ID.

SegWit's achievements:
- **Solves transaction malleability**: Laid the foundation for Layer 2 solutions like the Lightning Network
- **Increases capacity**: Expanded the block size limit from 1MB to approximately 4MB (by weight)
- **Reduces fees**: Lowered the weight of signature data, reducing transaction costs

SegWit was implemented as a soft fork (backward-compatible upgrade) and activated without network division. This set an important precedent showing that Bitcoin can improve gradually without breaking consensus.

## Related Concepts

- [Lightning Network](/ideas/lightning-network/) — A Bitcoin Layer 2 payment network built on SegWit
- [Node](/ideas/node/) — Independent validation software for the Bitcoin network
- [What is Bitcoin?](/start/bitcoin/) — Fundamental concepts and how Bitcoin works