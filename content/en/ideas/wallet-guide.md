---
title: "The Complete Guide to Bitcoin Wallets"
description: "A comparison and selection guide for Bitcoin wallet types. Beginner-friendly explanations from hardware wallets to mobile wallets"
tags: ["Bitcoin"]
levels: "입문"
weight: 38
---

In June 2023, approximately $100 million (about 130 billion KRW) worth of cryptocurrency was stolen from Atomic Wallet, a non-custodial wallet service. In September of the same year, $200 million vanished from Mixin Network. These incidents are not exceptions — they are a pattern. From Mt. Gox in 2014 (850,000 BTC), to FTX in 2022 ($8 billion), to the large and small hacks that repeat every year. **Is your Bitcoin safe?** The answer depends on which wallet you use.

## The Essence of a Wallet: It Stores Keys, Not Bitcoin

It is a misconception to think that Bitcoin is stored inside a Bitcoin wallet. All Bitcoin is recorded on the blockchain. A wallet is simply a tool that stores the **private key** that grants access to that Bitcoin.

Using a bank vault analogy, the gold (Bitcoin) is in the vault (blockchain), and the wallet serves as the place that holds the key to open that vault. If you lose the key, the gold does not disappear, but you can never retrieve it again. According to Chainalysis estimates, approximately 3 to 4 million BTC are permanently inaccessible due to lost private keys. That amounts to roughly 20% of the total supply.

## Custodial vs Non-Custodial: The Most Important Distinction

The first question to ask when choosing a wallet is "Who holds the keys?"

A **Custodial Wallet** is one where an exchange or service provider holds the private keys on your behalf. Keeping Bitcoin on 업비트, 빗썸, or Binance is a typical example. It is convenient, but if the company gets hacked or goes bankrupt, your assets disappear. This is where the saying "Not your keys, not your coins" originates.

A **Non-Custodial Wallet** is one where the user manages the private keys directly. No one can freeze or seize your Bitcoin. However, if you lose your seed phrase, no one can recover it for you.

| Category | Custodial | Non-Custodial |
|------|-----------|-------------|
| Private key storage | Service provider | You |
| Hacking/bankruptcy risk | Provider risk exists | Depends on your own management |
| Possibility of access being blocked | Yes (freeze/seizure) | No |
| Recovery responsibility | Provider's customer support | You (seed phrase) |
| Suitable use | Exchange trading | Long-term storage, sovereignty |

## Hot Wallets vs Cold Wallets: Balancing Security and Convenience

Non-custodial wallets are divided into hot wallets and cold wallets based on whether they are connected to the internet.

### Hot Wallets — For Everyday Payments

These operate while connected to the internet. You can install them on a smartphone or computer and use them right away.

- **Mobile wallets**: Phoenix, Blue Wallet, Muun, etc. You can send and receive Bitcoin within 5 minutes of installation. Optimized for cafe payments and small transfers.
- **Desktop wallets**: Sparrow Wallet, Electrum, Bitcoin Core, etc. The larger screen and rich feature set make them well-suited for UTXO management, fee optimization, and privacy enhancement.
- **Web wallets**: Accessed through a browser. No installation required, but most vulnerable to phishing.

**Pros**: Convenient and fast.
**Cons**: Always connected to the internet = exposure to malware, keyloggers, and remote hacking.
**Recommendation**: Store only 10–20% of your total holdings — the amount needed for everyday spending.

### Cold Wallets — For Long-Term Storage

Private keys are stored in an environment completely disconnected from the internet. This eliminates the network connection itself, which is the biggest attack vector for hacking.

- **Hardware wallets**: Dedicated devices such as Coldcard, Trezor, Ledger, BitBox02, etc. They connect briefly only when signing transactions and remain completely offline the rest of the time. Private keys never leave the device.
- **Paper wallets**: Private keys printed on paper. Theoretically fully offline, but currently not recommended due to the risk of ink fading and paper damage.

**Pros**: Fundamentally safe from network attacks.
**Cons**: Instant transfers are inconvenient, and there is a cost to purchase the device.
**Recommendation**: 80–90% of your total holdings — assets for long-term storage.

## Wallet Types at a Glance

| Category | Hot Wallet (Mobile) | Hot Wallet (Desktop) | Cold Wallet (Hardware) | Exchange (Custodial) |
|------|-----------------|-------------------|---------------------|-------------------|
| Private key storage | You (smartphone) | You (computer) | You (dedicated device) | Exchange |
| Internet connection | Always | Always | Only when signing | Always |
| Security level | ★★☆☆☆ | ★★★☆☆ | ★★★★★ | ★★☆☆☆ |
| Convenience | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★★ |
| Suitable amount | Up to ~500,000 KRW | Up to ~5,000,000 KRW | No limit | Trading only |
| Representative products | Phoenix, Blue Wallet | Sparrow, Electrum | Coldcard, Trezor | 업비트, Binance |

## Hardware Wallet Comparison

Here we compare the major hardware wallet products, which are most suitable for long-term storage.

| Product | Features | Pros | Cons |
|------|------|------|------|
| **Coldcard** | Bitcoin-only, air-gap support | Top-tier security, SD card/QR transactions | High technical barrier to entry |
| **Trezor** | Open-source pioneer | Full source code disclosure, intuitive UI | Reports of possible hacking with physical access |
| **Ledger** | World's highest sales volume | Wide coin support, broad ecosystem | 2020 customer data breach, Recover controversy |
| **BitBox02** | Swiss-made, Bitcoin-only version available | Simple design, open source | Relatively low brand recognition |

If you are a beginner, starting with **Trezor** or **BitBox02 Bitcoin-only** is recommended. For advanced users who prioritize security above all else, **Coldcard** is the best choice. When purchasing, always order exclusively from the **official website**, and never use a second-hand hardware wallet.

## Recommendations by Scenario

### Scenario 1: Bitcoin Beginner (Investment Under 500,000 KRW)

**Recommendation**: Mobile hot wallet (Blue Wallet or Phoenix)

After purchasing Bitcoin on an exchange, withdraw it to a mobile wallet and learn the basics. This is the stage for experiencing address formats, transaction confirmations, and fee structures with small amounts. The most important thing at this stage is to **build the habit of backing up your seed phrase**.

### Scenario 2: Dollar-Cost Averaging Investor (1,000,000–10,000,000 KRW)

**Recommendation**: Hardware wallet (Trezor or BitBox02)

If you are accumulating a fixed amount of Bitcoin each month, consider purchasing a hardware wallet once you surpass the 1,000,000 KRW mark. Establish a routine of buying on the exchange and then withdrawing to your hardware wallet. Store your seed phrase engraved on a **steel plate**, not on paper.

### Scenario 3: Long-Term Large-Amount Holder (Over 10,000,000 KRW)

**Recommendation**: Coldcard + Multisig

If you are storing tens of millions of KRW worth of Bitcoin, relying on a single wallet is risky. Set up [multisig](/ideas/multisig/) so that a certain number of keys out of several (e.g., 2 out of 3) must sign to approve a transaction. This fundamentally prevents single points of failure (device loss, theft).

### Scenario 4: Everyday Payment User

**Recommendation**: Lightning-enabled mobile wallet (Phoenix) + hardware wallet in parallel

To buy coffee or send small amounts with Bitcoin, the [Lightning Network](/ideas/lightning-network/) is essential. Put a small amount in a Lightning-enabled wallet like Phoenix for payments, and keep the vast majority in a hardware wallet. It is the same principle as separating the cash in your physical wallet from your bank account.

## Seed Phrase: More Important Than the Wallet Itself

No matter which wallet you choose, the core of security ultimately lies in the **seed phrase**.

A seed phrase consists of 12 or 24 English words according to the BIP-39 standard. These words are the master seed that generates all of the wallet's private keys. Even if your hardware wallet breaks, as long as you have the seed phrase, you can restore the same wallet anywhere. Conversely, if you lose the seed phrase, no expert in the world can recover it. This is not a bug — it is a core design feature of Bitcoin's security.

For additional security, you can set a **passphrase (also known as the 25th word)**. Even if the seed phrase is exposed, assets cannot be accessed without the passphrase.

## Security Checklist

Once you have finished setting up your wallet, go through each item below.

**Seed Phrase Storage**
- [ ] I wrote down the seed phrase by hand (I did not store it on a digital device)
- [ ] I engraved it on a steel plate (protection against fire and flood)
- [ ] I stored copies in at least 2 separate locations
- [ ] I never entered it into any cloud service, email, or messenger

**Device Security**
- [ ] I purchased the hardware wallet as a new item from the official website
- [ ] I downloaded the wallet software from the official site
- [ ] I updated the firmware/app to the latest version
- [ ] I set a PIN code (no birthdays or sequential numbers)

**Operational Security**
- [ ] I keep only small amounts in hot wallets
- [ ] I store large amounts in a hardware wallet or multisig setup
- [ ] I do not unnecessarily disclose that I hold Bitcoin
- [ ] I have prepared an inheritance plan (communicated seed phrase access method to a trusted person)

**Scam Prevention**
- [ ] I understand that any request to "enter your seed phrase" is unconditionally a scam
- [ ] I know that official support teams never ask for private keys or seed phrases
- [ ] I ignore "help" offers that come via DMs

## Related Concepts

- [Multisig](/ideas/multisig/) — A security mechanism that uses multiple signatures to prevent single points of failure
- [Lightning Network](/ideas/lightning-network/) — A Layer 2 solution that enables everyday Bitcoin payments
- [Node](/ideas/node/) — A Bitcoin full node that verifies your own transactions directly
- [What is Bitcoin?](/start/bitcoin/) — The basic concept and workings of Bitcoin
