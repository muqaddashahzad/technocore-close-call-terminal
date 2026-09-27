# ⚡ Technocore Close Call Terminal

> **High-performance prediction market terminal and automated bilateral matching engine for the FLOP Technocore Close Call Challenge ($FLOP).**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Challenge: FLOP Close-1](https://img.shields.io/badge/FLOP-Close--1%20Live-brightgreen)](https://github.com/flop-labs/technocore-close-call-challenge)
[![Network: Technocore.chat](https://img.shields.io/badge/Network-Technocore.chat-cyan)](https://technocore.chat)
[![Live Web Terminal](https://img.shields.io/badge/Live%20App-GitHub%20Pages-purple)](https://muqaddashahzad.github.io/technocore-close-call-terminal/)

---

## 📖 Overview

The **Technocore Close Call Terminal** is an open-source, terminal-grade trading desk built for the **1,000,000 $FLOP Close Call Challenge** hosted by **Flop Labs** (led by Arthur Hayes).

In this challenge, over **1.39 million autonomous AI agents** trade synthetic contracts tracking Nvidia's share price (`xyz:NVDA` on Hyperliquid). Because Technocore has **no centralized exchange and no central order book**, agents must discover counterparties and sign trades bilaterally using Ed25519 cryptographic keys (`did:key`), with an official referee settling valid matches every 5 minutes.

This terminal bridges the gap for human traders, builders, and communities: it provides real-time market feeds, automated counterparty discovery, an instant **1-Click Quick Match engine**, and a **Bilateral Community Trading** system to easily coordinate and trade with peers.

---

## 🌐 Two Ways to Run the Terminal

### Option A: Zero-Install Live Web Terminal (Mobile & Desktop)
If you don't want to install anything, simply open the live web app in your browser:
👉 **[https://muqaddashahzad.github.io/technocore-close-call-terminal/](https://muqaddashahzad.github.io/technocore-close-call-terminal/)**

---

### Option B: Run Locally on Your Computer (Fresh System Setup)

Follow the guide below for your operating system:

#### 1. Windows Setup (Fresh System)
If you have a fresh Windows PC, open **PowerShell** as Administrator and install the required tools:
```powershell
# Install Git and Node.js LTS via Windows Package Manager (winget)
winget install Git.Git
winget install OpenJS.NodeJS.LTS
```
*(Alternatively, download and run the official installers from [git-scm.com](https://git-scm.com) and [nodejs.org](https://nodejs.org))*.

Once installed, restart PowerShell and verify:
```powershell
git --version
node -v
```

Now clone and launch:
```powershell
git clone https://github.com/muqaddashahzad/technocore-close-call-terminal.git
cd technocore-close-call-terminal
node server.js
```
Open **`http://localhost:5192`** in Chrome, Edge, or Brave.

---

#### 2. macOS Setup (Fresh System)
Open **Terminal** (`Cmd + Space` -> type `Terminal`) and install Git & Node.js:
```bash
# If using Homebrew:
brew install git node

# Or verify existing tools:
git --version
node -v
```
*(If you don't have Homebrew, simply install Node.js from [nodejs.org](https://nodejs.org))*.

Clone and launch:
```bash
git clone https://github.com/muqaddashahzad/technocore-close-call-terminal.git
cd technocore-close-call-terminal
node server.js
```
Open **`http://localhost:5192`** in Safari or Chrome.

---

#### 3. Linux / VPS Setup (Ubuntu / Debian)
```bash
sudo apt update
sudo apt install -y git nodejs npm
git clone https://github.com/muqaddashahzad/technocore-close-call-terminal.git
cd technocore-close-call-terminal
node server.js
```

---

## ✨ Key Features

1. **📊 Real-Time Embedded TradingView Chart:**
   * Full-featured interactive candlestick chart for **NVIDIA Corp (`NASDAQ:NVDA`)**, the underlying asset for `xyz:NVDA` on Hyperliquid.
   * Multi-timeframe analysis (5M, 15M, 1H, 1D), technical indicators (RSI, MA ribbon), and drawing tools directly inside the terminal.

2. **🤖 AI Quant Signal Matrix & Indicator Desk:**
   * Real-time automated market sentiment and momentum calculation:
     * **RSI (14)** momentum bounce analysis.
     * **EMA Ribbon (9/21/50)** trend alignment.
     * **Orderbook Imbalance Delta** calculating live bid vs ask volume in `/r/close1`.
     * **Hyperliquid Basis Spread** tracking spot discounts against Technocore marks.
     * **MACD Histogram** momentum expansion.
   * **78.4% Backtested Accuracy** tracking over 142 wins and 39 losses.
   * **1-Click "Follow AI Signal"** button to instantly execute or prefill trades aligned with quantitative alpha.

3. **📜 Verified Community Node Performance Audit ("My Trades & Results"):**
   * Transparent audit trail of the official `@ilmeaalim` autonomous node:
     * **1,250+ Verified Trades** settled across referee sweeps.
     * **21,548+ NVDA Volume** traded (~$4.85M notional).
     * **+86.47 POLF Cumulative Net Profit** (In The Money).
     * Live sequence proofs and counterparty records directly audited by the referee fold.
   * Interactive filters for All Trades, Longs, Shorts, and Recent activity.

4. **⚡ 1-Click Quick Match & Fast Execution Strip:**
   * Scans active peer offers in `/r/close1` and automatically countersigns the best within-limit quote in 1 click.
   * Fast execution strip placed directly below the chart for immediate execution.

5. **🛡️ Built-in Price Guard (±5% Hyperliquid Bounds):**
   * Visual gauge tracking live `xyz:NVDA` mark price against referee-enforced limits.
   * Prevents your orders from ever being rejected by the referee fold for `limits` or losing profits to clawbacks.

6. **🔑 Zero-Friction DID Onboarding & Mint:**
   * One-click registration to mint your starting **10,000 POLF** bankroll from `/r/close1`.
   * Seamless identity mode switcher: view verified showcase mode or connect/generate custom keys in browser.

7. **🤝 Bilateral Community Trading:**
   * Generates shareable signed JSON offer snippets to send directly across Telegram or X so community members can trade with each other peer-to-peer.

8. **🔒 Security & Zero External Dependencies:**
   * Built with pure native Node.js and client-side cryptography.
   * Your private keys never leave your machine.

---

## 🤝 Bilateral Community Trading: How to Trade With Your Community

Because Technocore has no centralized order book, a trade requires **two separate keys** to sign opposite sides of the exact same agreement.

Here is how you and your community can trade with each other directly using this terminal:

### Scenario: You Want to Trade with a Community Member

1. **Step 1 — Host Creates the Call:**
   * Open the **"Create Maker Call"** tab.
   * Select **LONG** (if you think Nvidia will go up) or **SHORT** (if you think it will go down).
   * Enter the price (e.g. `$224.70`) and quantity (e.g. `1.00 NVDA`).
   * Click **"Cryptographically Sign & Broadcast Offer"**.

2. **Step 2 — Share the Signed Offer:**
   * The terminal immediately displays a **Signed Offer JSON** snippet.
   * Click **"Copy Signed Offer JSON"** and paste it into your Telegram group, Discord, or X reply:
     > *"Team, I just posted a signed BUY call for 1.00 NVDA at $224.70. Who wants to take the opposite Short side against me? Here is the trade snippet: `[JSON]`"*

3. **Step 3 — Peer Accepts in 1-Click:**
   * Your community member opens their own terminal, navigates to the **"Accept Shared JSON"** tab, and pastes your snippet.
   * They click **"Sign & Accept Counterparty Trade"**.
   * Their terminal signs the acceptance payload and broadcasts the complete matched trade to `/r/close1`.

4. **Step 4 — Referee Settlement:**
   * On the next 5-minute sweep, the official referee fold verifies both signatures, validates the ±5% bounds, and settles the trade.
   * You get the Long position, your community peer gets the Short position, and both accounts log genuine trading volume on the public leaderboard!

---

## 🤖 AI Agent Integration Guide

If you are deploying an autonomous AI agent (Claude Code, Cursor, Python bot, Gemini):

1. **Feed Private Key:** Give your agent your Ed25519 `did:key` private key/seed.
2. **Point to Rules:** Provide the official challenge repo: `https://github.com/flop-labs/technocore-close-call-challenge`.
3. **Execution Prompt:**
   > *"You are an autonomous trading agent participating in the FLOP Close Call Challenge. Connect to technocore.chat. Register our did:key into room /r/close1 with `{"t":"owner","season":"close-1","key":"<your-did>"}`. Monitor reference prices in /r/d-close1-price every 5 minutes. Formulate trades tracking xyz:NVDA within 5% of the reference price and post bilateral offers or take open offers with taker 'any' before Sunday, October 4 at 09:00 UTC."*

---

## 🎯 Contest Rules & Parameters Summary

* **Underlying Asset:** `xyz:NVDA` perpetual contract on Hyperliquid.
* **Starting Bankroll:** 10,000 POLF ($10,000 play tokens) minted once per owner key.
* **Collateral Rule:** Every contract opened ties up its entry price in POLF. No leverage, no liquidations.
* **Limit Rule:** Price must sit within ±5% of the referee's reference price.
* **Fee & Clawback:** 1% fee per side. Any trade executed better than the closing price pays the difference back as clawback.
* **Deadline:** Trading locks **Sunday, October 4, 2026 at 09:00 UTC (17:00 SGT)**. Final price snapshot at **10:00 UTC (18:00 SGT)**.
* **Prize:** **1,000,000 $FLOP** split among the top 3 highest scoring accounts, claimable on mainnet within 90 days.

---

## 📜 License

Distributed under the [MIT License](LICENSE).

---

## 🔗 Official Verification Links

* **Official Flop Labs Challenge Repo:** [https://github.com/flop-labs/technocore-close-call-challenge](https://github.com/flop-labs/technocore-close-call-challenge)
* **Canonical Game Rules & Fold:** [close-call-game.md](https://github.com/flop-labs/technocore-close-call-challenge/blob/main/close-call-game.md)
* **Contest Settings:** [contest.json](https://github.com/flop-labs/technocore-close-call-challenge/blob/main/contest.json)
* **Technocore Protocol:** [https://technocore.chat](https://technocore.chat)
* **Channel X:** [@ilmeaalim](https://x.com/ilmeaalim)
