---
title: "UTXO Model (Unspent Transaction Output)"
description: "Bitcoin manages balances not as account totals but as sums of unspent transaction outputs (UTXOs). The coin model's principles and its privacy and security advantages."
tags: ["Bitcoin"]
levels: "intermediate"
weight: 39
---

**UTXO (Unspent Transaction Output)** is the fundamental way Bitcoin manages balances. Rather than recording an "account balance" like a bank, Bitcoin calculates your balance as the sum of individual outputs that have not yet been spent.

## The Coin Model

Think of a cash transaction. If your wallet holds two ¥10,000 notes and one ¥5,000 note, your balance is not a single number "¥25,000" — it is **the sum of three separate bills**. Bitcoin works the same way.

When a Bitcoin transaction occurs:
1. **Inputs**: One or more previously received UTXOs are "consumed"
2. **Outputs**: New UTXOs are created — the amount sent to the recipient and the change returned to the sender
3. Consumed UTXOs are permanently destroyed, and new UTXOs are born

For example, if someone with a 0.7 BTC UTXO sends 0.3 BTC:
- The 0.7 BTC UTXO is consumed
- A 0.3 BTC UTXO is created for the recipient
- Approximately 0.3999 BTC UTXO returns to the sender as change
- The remaining 0.0001 BTC goes to the miner as a fee

## Why Not an Account Model?

Ethereum uses a bank-like account balance model. Bitcoin chose the seemingly more complex UTXO model for good reasons:

- **Parallel verification**: Each UTXO is independent, allowing transactions to be verified simultaneously. Account models create sequential dependencies
- **Double-spend prevention**: A UTXO exists in only two states — "spent" or "unspent." Partial spending is impossible, making double-spend detection simple
- **Privacy**: Generating a new address (new UTXO) for each transaction makes tracking more difficult

## Practical UTXO Management

The number and size of your UTXOs directly affect fees:

- **Dust UTXOs**: If you accumulate many tiny UTXOs, the fee to spend them may exceed their value
- **UTXO Consolidation**: A strategy of merging multiple small UTXOs into one during low-fee periods
- **Coin Control**: Manually selecting which UTXOs to use as inputs, optimizing for privacy and fees

Desktop wallets like Sparrow Wallet provide features to inspect and manage individual UTXOs.

## Related Concepts

- [Bitcoin Wallet Guide](/ideas/wallet-guide/) — The tools for managing UTXOs in practice
- [Multisig](/ideas/multisig/) — Strengthening UTXO security with multiple signatures
- [SegWit](/ideas/segwit/) — Improving UTXO processing efficiency by separating signature data
- [Lightning Network](/ideas/lightning-network/) — Off-chain payment channels built on UTXOs
