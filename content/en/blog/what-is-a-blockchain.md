---
title: "What Is a Blockchain"
date: 2026-02-25T10:00:00+09:00
description: "A simple explanation of how the blockchain, the core technology behind Bitcoin, works."
tags: ["Bitcoin"]
draft: false
---

## The Essence of a Blockchain

A blockchain is a distributed ledger. A bank's ledger exists in only one place — the bank's servers. The bank can modify it at will, and it can be hacked or go bankrupt. Bitcoin's blockchain is identically copied across tens of thousands of nodes (computers) worldwide. Hacking any one of them leaves the original intact everywhere else.

## The Structure of a Block

As the name suggests, a blockchain is a structure where blocks are linked together like a chain.

Each block contains:
- A batch of transaction records for a period (roughly 2,000 transactions)
- The hash of the previous block (the connecting link)
- The result of the Proof of Work

A **hash** is a function that takes any data as input and outputs a unique string of fixed length. If even a single bit of data changes, the hash changes completely. Because each block contains the hash of the previous block, modifying any past block causes the hashes of all subsequent blocks to change in a cascade. This is the core principle that makes the blockchain difficult to tamper with.

## The Meaning of Decentralization

Traditional databases are controlled by central servers. Google can delete your email data; a bank can freeze your account.

No single entity controls the Bitcoin blockchain. Changing the rules requires the agreement of a majority of node operators worldwide. This provides resistance to censorship and control.

## Blockchain ≠ Bitcoin

An important distinction: blockchain is the technology, and Bitcoin is the first and most successful implementation using that technology.

In the 2010s, the phrase "blockchain is good, but Bitcoin isn't necessary" became fashionable. However, the core values of blockchain — decentralization and minimizing trust — only mean something in a truly decentralized network like Bitcoin. A blockchain controlled from the center is just a slow database.
