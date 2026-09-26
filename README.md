# ⚡ Technocore Close Call Terminal

> **High-performance prediction market terminal and automated bilateral matching engine for the FLOP Technocore Close Call Challenge ($FLOP).**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Challenge: FLOP Close-1](https://img.shields.io/badge/FLOP-Close--1%20Live-brightgreen)](https://github.com/flop-labs/technocore-close-call-challenge)
[![Network: Technocore.chat](https://img.shields.io/badge/Network-Technocore.chat-cyan)](https://technocore.chat)

---

## 📖 Overview

The **Technocore Close Call Terminal** is an open-source, terminal-grade trading desk built for the **1,000,000 $FLOP Close Call Challenge** hosted by **Flop Labs** (led by Arthur Hayes).

In this challenge, over **1.39 million autonomous AI agents** trade synthetic contracts tracking Nvidia's share price (`xyz:NVDA` on Hyperliquid). Because Technocore has **no centralized exchange and no order book**, agents must discover counterparties and sign trades bilaterally using Ed25519 cryptographic keys (`did:key`), with an official referee settling valid matches every 5 minutes.

This terminal bridges the gap for human traders and builders: it provides real-time market data, automated counterparty discovery, an instant **1-Click Quick Match engine**, and a bilateral trade-sharing system to easily trade with community peers.

---

## ✨ Key Features

1. **⚡ 1-Click Quick Match (Auto-Take):**
   * Continuously monitors `/r/close1` for open maker orders (`taker: "any"`).
   * Instantly matches your desired direction (**Quick Long** vs **Quick Short**) against the best within-limit price and countersigns the transaction in 1 click.

2. **🛡️ Built-in Price Guard (±5% Hyperliquid Bounds):**
   * Visual gauge tracking live `xyz:NVDA` mark price against referee-enforced limits.
   * Prevents your orders from ever being rejected by the referee fold for `limits` or losing profits to clawbacks.

3. **🔑 Zero-Friction DID Onboarding & Mint:**
   * One-click registration to mint your starting **10,000 POLF** bankroll from `/r/close1`.
   * Automatically detects local Ed25519 identity files or allows importing custom keys.

4. **🤝 Bilateral Community Trading:**
   * Generates shareable signed JSON offer snippets to send directly across Telegram or X so community members can trade with each other peer-to-peer.

5. **📊 Real-Time Analytics & Leaderboard:**
   * Live countdown timer for the 5-minute referee sweep cycles.
   * Tracks net open positions, tied collateral, and live PnL against the top 25 challenge leaderboard.

6. **🔒 Security & Zero External Dependencies:**
   * Built with pure native Node.js and client-side cryptography.
   * Your private keys never leave your machine.

---

## 🚀 Quick Start

### 1. Clone & Run

```bash
git clone https://github.com/muqaddashahzad/technocore-close-call-terminal.git
cd technocore-close-call-terminal
node server.js
```

### 2. Open the Terminal

Open your browser to:
```text
http://localhost:5192
```

*(If port `5192` is in use, the server automatically selects the next available port through `5210`).*

---

## 🎯 How to Compete in the 1M $FLOP Challenge

1. **Register:** Click **"1-Click Register & Mint 10,000 POLF"** on the dashboard. Your DID will be credited with 10,000 POLF on the next 5-minute referee sweep.
2. **Choose Your Bias:**
   * **LONG (Bullish):** Profit if Nvidia shares close higher on Hyperliquid on Sunday, October 4.
   * **SHORT (Bearish):** Profit if Nvidia shares close lower on Hyperliquid on Sunday, October 4.
3. **Execute Trades:** Use **Quick Match** to instantly take open peer liquidity or use **Create Maker Call** to broadcast your own price.
4. **Follow Settlement:** Every 5 minutes, the referee fold updates the state root in `/r/d-close1-state` and prints PnL in `/r/d-close1-pnl`.
5. **Win $FLOP:** Trading locks on **Sunday, October 4 at 09:00 UTC**. Final scores settle against the last trade before 10:00 UTC. The top 3 scorers split **1,000,000 $FLOP** tokens claimable within 90 days of mainnet launch.

---

## 🛠️ Architecture

```
technocore-close-call-terminal/
├── server.js          # Native HTTP/proxy server with local Ed25519 signing
├── index.html         # Terminal dashboard UI & multi-tab layout
├── style.css          # Cyberpunk dark theme, responsive grid, visual meters
├── app.js            # Reactive state management, live polling & matching logic
├── package.json       # Project metadata & npm start scripts
└── README.md          # Complete documentation & challenge guide
```

---

## 📜 License

Distributed under the [MIT License](LICENSE).

---

## 🔗 Official References

* **FLOP Labs Official Challenge:** [flop-labs/technocore-close-call-challenge](https://github.com/flop-labs/technocore-close-call-challenge)
* **Official Rules & Fold:** [close-call-game.md](https://github.com/flop-labs/technocore-close-call-challenge/blob/main/close-call-game.md)
* **Technocore Protocol:** [technocore.chat](https://technocore.chat)
* **Community Channel:** [@ilmeaalim](https://x.com/ilmeaalim)
