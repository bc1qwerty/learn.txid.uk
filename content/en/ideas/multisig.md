---
title: "Multisig (Multisig) — Multi-Signature Security"
date: 2026-03-10
tags: ["Bitcoin"]
description: "Multisig is a security mechanism that requires signatures from multiple private keys in Bitcoin transactions, with a threshold number of signatures needed for approval."
levels: "Beginner"
weight: 29
---

**Multisig (Multisig)** is a security mechanism that requires signatures from multiple private keys to approve Bitcoin transactions, with a threshold number of signatures needed.

Common configurations (M-of-N):
- **2-of-3**: Requires 2 signatures out of 3 keys. You can still access funds even if one key is lost
- **3-of-5**: Suitable for joint management by companies or organizations
- **2-of-2**: Both parties must agree for a transaction to go through (escrow)

Uses of Multisig:
- **Personal Security**: Distribute keys across multiple locations to eliminate single points of failure
- **Corporate Management**: Funds cannot be moved without approval from multiple executives
- **Inheritance Planning**: Share keys with family members while preventing unauthorized withdrawals

Multisig extends Bitcoin's philosophy of replacing trust with technology. It's similar to a double-lock mechanism on a bank vault, but works even when signatories are distributed across the world.

## Related Concepts

- [Node](/ideas/node/) — Independent validation software for the Bitcoin network
- [What is Bitcoin?](/start/bitcoin/) — Basic concepts and how Bitcoin works
- [Private Property Rights](/ideas/private-property/) — The right to exclusively own personal property