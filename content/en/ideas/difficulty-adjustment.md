---
title: "Difficulty Adjustment — Bitcoin's Constancy"
date: 2026-02-27
tags: ["Bitcoin"]
description: "Difficulty adjustment is a mechanism that automatically adjusts mining difficulty every 2,016 blocks to maintain an average block generation time of 10 minutes."
levels: "입문"
weight: 21
---

**Difficulty Adjustment** is a mechanism that automatically adjusts mining difficulty every 2,016 blocks (approximately 2 weeks) to maintain an average block generation time of 10 minutes.

By measuring the actual time taken for the previous 2,016 blocks:
- If faster than 10 minutes → difficulty increases
- If slower than 10 minutes → difficulty decreases

Why this matters:
- **Predictable issuance**: No matter how many miners join, the issuance rate doesn't accelerate
- **Self-regulation**: The network maintains balance on its own without external administrators
- **Security preservation**: Even if miners decrease, the network adapts and doesn't stop

Gold mining increases when prices rise, but with Bitcoin's difficulty adjustment, increased demand doesn't lead to increased supply. This key design makes Bitcoin a more sound currency than gold.

## Related Concepts

- [Proof of Work](/ideas/proof-of-work/) — The consensus mechanism where miners create blocks by consuming computational power
- [Halving](/ideas/halving/) — Bitcoin's issuance schedule where block rewards are cut in half approximately every 4 years
- [Node](/ideas/node/) — Participants in the Bitcoin network who validate transactions and blocks
- [What is Bitcoin?](/start/bitcoin/) — A starting point introducing Bitcoin's basic concepts and how it works