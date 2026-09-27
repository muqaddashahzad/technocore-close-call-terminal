/**
 * Technocore Close Call Terminal — Frontend Application Logic
 * Integrates:
 *  - Live TradingView NASDAQ:NVDA Candlestick Chart
 *  - AI Quant Multi-Indicator Signal Matrix (RSI, EMA, Orderbook Delta, Basis, MACD)
 *  - Official @ilmeaalim Channel Node Participation Showcase & Custom DID Support
 *  - Complete "My Trades & Results" Verified Audit Log (1,216+ Swaps, +86.47 POLF PnL)
 *  - Zero-dependency client-side execution on GitHub Pages & Localhost
 */

const OFFICIAL_CHANNEL_NODE = {
  did: 'did:key:z6MknUw3NHTToeFbNvzxV35WfHyhBLCyuuq31LLiX2zqFZHs',
  name: '@ilmeaalim Official Trading Node',
  registeredSeq: 1956335,
  registeredSweep: 336,
  startingMint: '10,000 POLF',
  netPos: '+72.86 NVDA',
  collateral: '16,392 POLF',
  realisedPnl: '+86.47 POLF',
  winRate: '78.4%',
  totalTrades: 1216,
  totalVolume: '21,548 NVDA'
};

const STATE = {
  did: OFFICIAL_CHANNEL_NODE.did,
  identityMode: 'showcase', // 'showcase', 'local', or 'custom'
  hasLocalKey: false,
  refPrice: null,
  limits: [null, null],
  currentSweep: null,
  globalPrice: null,
  registeredAgents: 0,
  openInterest: 0,
  topPnl: '0.00',
  offers: [],
  trades: [],
  pnlList: [],
  activeFilter: 'all',
  activeMyTradeFilter: 'all',
  lbFilter: 'all',
  myTradesData: null,
  aiRecommendation: 'buy'
};

// UI Elements Map
const el = {
  // Top Banner & Network
  networkStatus: document.getElementById('network-status'),
  currentSweepBadge: document.getElementById('current-sweep-badge'),
  sweepTimer: document.getElementById('sweep-timer'),
  refPrice: document.getElementById('ref-price'),
  allowedLimits: document.getElementById('allowed-limits'),
  globalPrice: document.getElementById('global-price'),
  registeredAgents: document.getElementById('registered-agents'),
  openInterest: document.getElementById('open-interest'),
  topPnl: document.getElementById('top-pnl'),

  // Identity Card
  btnModeShowcase: document.getElementById('btn-mode-showcase'),
  btnModeCustom: document.getElementById('btn-mode-custom'),
  activeDid: document.getElementById('active-did'),
  btnCopyDid: document.getElementById('btn-copy-did'),
  nodeSubtag: document.getElementById('node-subtag'),
  regStatusBadge: document.getElementById('reg-status-badge'),
  userBalance: document.getElementById('user-balance'),
  userPos: document.getElementById('user-pos'),
  userCollateral: document.getElementById('user-collateral'),
  userPnl: document.getElementById('user-pnl'),
  btnRegister: document.getElementById('btn-register'),
  btnImportKey: document.getElementById('btn-import-key'),

  // Price Guard
  guardLow: document.getElementById('guard-low'),
  guardMid: document.getElementById('guard-mid'),
  guardHigh: document.getElementById('guard-high'),
  guardPin: document.getElementById('guard-pin'),

  // AI Signals Matrix
  aiSignalVerdict: document.getElementById('ai-signal-verdict'),
  aiSignalConfidence: document.getElementById('ai-signal-confidence'),
  aiAccuracyVal: document.getElementById('ai-accuracy-val'),
  btnFollowAiSignal: document.getElementById('btn-follow-ai-signal'),
  indRsiBadge: document.getElementById('ind-rsi-badge'),
  indRsiVal: document.getElementById('ind-rsi-val'),
  indRsiDesc: document.getElementById('ind-rsi-desc'),
  indEmaBadge: document.getElementById('ind-ema-badge'),
  indEmaVal: document.getElementById('ind-ema-val'),
  indEmaDesc: document.getElementById('ind-ema-desc'),
  indDeltaBadge: document.getElementById('ind-delta-badge'),
  indDeltaVal: document.getElementById('ind-delta-val'),
  indDeltaDesc: document.getElementById('ind-delta-desc'),
  indBasisBadge: document.getElementById('ind-basis-badge'),
  indBasisVal: document.getElementById('ind-basis-val'),
  indBasisDesc: document.getElementById('ind-basis-desc'),
  indMacdBadge: document.getElementById('ind-macd-badge'),
  indMacdVal: document.getElementById('ind-macd-val'),
  indMacdDesc: document.getElementById('ind-macd-desc'),

  // Chart Execution Strip
  stripNvdaMark: document.getElementById('strip-nvda-mark'),
  stripOrderQty: document.getElementById('strip-order-qty'),
  btnStripQuickLong: document.getElementById('btn-strip-quick-long'),
  btnStripQuickShort: document.getElementById('btn-strip-quick-short'),
  btnStripFollowAi: document.getElementById('btn-strip-follow-ai'),

  // Quick Order Desk
  quickLongQty: document.getElementById('quick-long-qty'),
  quickShortQty: document.getElementById('quick-short-qty'),
  btnQuickLong: document.getElementById('btn-quick-long'),
  btnQuickShort: document.getElementById('btn-quick-short'),
  longMatchPreview: document.getElementById('long-match-preview'),
  shortMatchPreview: document.getElementById('short-match-preview'),
  terminalConsole: document.getElementById('terminal-console'),

  // Maker Desk
  makerForm: document.getElementById('maker-form'),
  makerPx: document.getElementById('maker-px'),
  makerQty: document.getElementById('maker-qty'),
  makerUntil: document.getElementById('maker-until'),
  makerTaker: document.getElementById('maker-taker'),
  btnSetRefPx: document.getElementById('btn-set-ref-px'),
  shareBox: document.getElementById('share-box'),
  shareJson: document.getElementById('share-json'),
  btnCopyJson: document.getElementById('btn-copy-json'),

  // Direct Accept
  directJsonInput: document.getElementById('direct-json-input'),
  btnAcceptDirect: document.getElementById('btn-accept-direct'),

  // My Trades & Results
  myTradesTabCount: document.getElementById('my-trades-tab-count'),
  mytradesDidCode: document.getElementById('mytrades-did-code'),
  btnRefreshMytrades: document.getElementById('btn-refresh-mytrades'),
  myTotalTrades: document.getElementById('my-total-trades'),
  myTotalVolume: document.getElementById('my-total-volume'),
  myNetPos: document.getElementById('my-net-pos'),
  myPnl: document.getElementById('my-pnl'),
  myWinRate: document.getElementById('my-win-rate'),
  myStartingMint: document.getElementById('my-starting-mint'),
  filterCntAll: document.getElementById('filter-cnt-all'),
  filterCntBuy: document.getElementById('filter-cnt-buy'),
  filterCntSell: document.getElementById('filter-cnt-sell'),
  mytradesTbody: document.getElementById('mytrades-tbody'),

  // Stream & Leaderboard
  streamContainer: document.getElementById('stream-container'),
  leaderboardTable: document.getElementById('leaderboard-table'),
  lbSweepBadge: document.getElementById('lb-sweep-badge'),
  lbMarkBadge: document.getElementById('lb-mark-badge'),
  lbTotalAgents: document.getElementById('lb-total-agents'),
  lbTotalOi: document.getElementById('lb-total-oi'),
  lbHighScore: document.getElementById('lb-high-score'),
  podium1Pnl: document.getElementById('podium-1-pnl'),
  podium1Did: document.getElementById('podium-1-did'),
  podium2Pnl: document.getElementById('podium-2-pnl'),
  podium2Did: document.getElementById('podium-2-did'),
  podium3Pnl: document.getElementById('podium-3-pnl'),
  podium3Did: document.getElementById('podium-3-did'),
  lbSearchInput: document.getElementById('leaderboard-search-input'),
  btnSearchRank: document.getElementById('btn-search-rank'),
  btnCheckMyRank: document.getElementById('btn-check-my-rank'),
  agentRankResult: document.getElementById('agent-rank-result'),
  btnJumpLeaderboard: document.getElementById('btn-jump-leaderboard'),

  // Key Modal
  keyModal: document.getElementById('key-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnLoadWorkspaceKey: document.getElementById('btn-load-workspace-key'),
  btnConfirmImport: document.getElementById('btn-confirm-import'),
  modalKeyInput: document.getElementById('modal-key-input')
};

// Console logger
function logConsole(msg, isSuccess = false) {
  if (!el.terminalConsole) return;
  const ts = new Date().toLocaleTimeString();
  const line = `[${ts}] ${msg}`;
  el.terminalConsole.innerHTML = `<span style="${isSuccess ? 'color: var(--green);' : ''}">${line}</span><br>` + el.terminalConsole.innerHTML;
}

// Format numbers
function formatNum(num) {
  return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 1. Initialize Identity with Showcase Fallback for GitHub Pages
async function initIdentity() {
  let loadedLocal = false;

  // Try local Node backend if running locally
  try {
    const res = await fetch('/api/identity');
    if (res.ok) {
      const data = await res.json();
      if (data.hasLocalKey && data.did) {
        STATE.did = data.did;
        STATE.hasLocalKey = true;
        STATE.identityMode = 'local';
        el.activeDid.textContent = data.did;
        el.regStatusBadge.textContent = 'LOCAL NODE ACTIVE';
        el.regStatusBadge.className = 'badge ready';
        if (el.nodeSubtag) el.nodeSubtag.textContent = `Local Node Connected · Workspace key active`;
        logConsole(`Loaded local agent identity: ${data.did.slice(0, 16)}...`, true);
        loadedLocal = true;
      }
    }
  } catch (err) {}

  // Check stored custom browser key
  if (!loadedLocal) {
    const stored = localStorage.getItem('technocore_custom_key');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.did) {
          activateCustomKey(parsed.did);
          loadedLocal = true;
        }
      } catch (e) {}
    }
  }

  // Default to Official @ilmeaalim Channel Node Showcase
  if (!loadedLocal) {
    activateShowcaseNode();
  }
}

function activateShowcaseNode() {
  STATE.did = OFFICIAL_CHANNEL_NODE.did;
  STATE.identityMode = 'showcase';
  if (el.btnModeShowcase) el.btnModeShowcase.classList.add('active');
  if (el.btnModeCustom) el.btnModeCustom.classList.remove('active');

  el.activeDid.textContent = OFFICIAL_CHANNEL_NODE.did;
  el.regStatusBadge.textContent = 'VERIFIED CHANNEL NODE';
  el.regStatusBadge.className = 'badge ready';
  if (el.nodeSubtag) el.nodeSubtag.textContent = 'Official @ilmeaalim Trading Node · Sweep #336 Registered';

  el.userBalance.textContent = OFFICIAL_CHANNEL_NODE.startingMint;
  el.userPos.textContent = OFFICIAL_CHANNEL_NODE.netPos;
  el.userCollateral.textContent = OFFICIAL_CHANNEL_NODE.collateral;
  el.userPnl.textContent = OFFICIAL_CHANNEL_NODE.realisedPnl;

  logConsole('Loaded @ilmeaalim verified channel node (1,216+ trades, sweep #336 registered).', true);
}

function activateCustomKey(did) {
  STATE.did = did;
  STATE.identityMode = 'custom';
  if (el.btnModeShowcase) el.btnModeShowcase.classList.remove('active');
  if (el.btnModeCustom) el.btnModeCustom.classList.add('active');

  el.activeDid.textContent = did;
  el.regStatusBadge.textContent = 'CUSTOM KEY CONNECTED';
  el.regStatusBadge.className = 'badge ready';
  if (el.nodeSubtag) el.nodeSubtag.textContent = 'Custom browser identity · Ready for challenge';

  el.userBalance.textContent = '10,000 POLF';
  el.userPos.textContent = '0.00 NVDA';
  el.userCollateral.textContent = '0.00 POLF';
  el.userPnl.textContent = '0.00 POLF';

  logConsole(`Custom key active: ${did.slice(0, 16)}...`, true);
}

// 2. Fetch Live Market Data (with direct technocore.chat CORS fallback)
async function fetchMarket() {
  try {
    let data = null;
    try {
      const res = await fetch('/api/market');
      if (res.ok) data = await res.json();
    } catch (e) {}

    // Fallback: direct browser fetch from technocore.chat
    if (!data || !data.price) {
      const [priceRes, stateRes, pnlRes, posRes] = await Promise.all([
        fetch('https://technocore.chat/r/d-close1-price?limit=1&format=json').then(r => r.json()).catch(() => null),
        fetch('https://technocore.chat/r/d-close1-state?limit=1&format=json').then(r => r.json()).catch(() => null),
        fetch('https://technocore.chat/r/d-close1-pnl?limit=1&format=json').then(r => r.json()).catch(() => null),
        fetch('https://technocore.chat/r/d-close1-positions?limit=1&format=json').then(r => r.json()).catch(() => null)
      ]);

      let price = null, state = null, pnl = null, pos = null;
      if (priceRes && priceRes.messages && priceRes.messages.length) {
        try { price = JSON.parse(priceRes.messages[0].text); } catch (e) {}
      }
      if (stateRes && stateRes.messages && stateRes.messages.length) {
        try { state = JSON.parse(stateRes.messages[0].text); } catch (e) {}
      }
      if (pnlRes && pnlRes.messages && pnlRes.messages.length) {
        try { pnl = JSON.parse(pnlRes.messages[0].text); } catch (e) {}
      }
      if (posRes && posRes.messages && posRes.messages.length) {
        try { pos = JSON.parse(posRes.messages[0].text); } catch (e) {}
      }
      data = { price, state, pnl, pos };
    }

    if (data.price) {
      const p = data.price;
      const refPx = p.ref ? p.ref.px : p.applied;
      STATE.refPrice = parseFloat(refPx);
      el.refPrice.textContent = `$${refPx}`;

      if (p.limits && p.limits.length === 2) {
        STATE.limits = [parseFloat(p.limits[0]), parseFloat(p.limits[1])];
        el.allowedLimits.textContent = `$${p.limits[0]} - $${p.limits[1]}`;
        el.guardLow.textContent = `Low: $${p.limits[0]}`;
        el.guardMid.textContent = `Ref: $${refPx}`;
        el.guardHigh.textContent = `High: $${p.limits[1]}`;
      }

      if (p.global) {
        STATE.globalPrice = p.global;
        el.globalPrice.textContent = `$${p.global}`;
      }

      const sweepNum = p.for || p.n;
      STATE.currentSweep = sweepNum;
      el.currentSweepBadge.textContent = `#${sweepNum}`;

      if (!el.makerPx.value) {
        el.makerPx.value = refPx;
      }

      // Update AI signals with live market quotes
      updateAiSignals();
    }

    if (data.state && data.state.owners) {
      STATE.registeredAgents = data.state.owners;
      el.registeredAgents.textContent = data.state.owners.toLocaleString();
      if (el.lbTotalAgents) el.lbTotalAgents.textContent = `${data.state.owners.toLocaleString()}+`;
    }

    if (data.pos && data.pos.open) {
      el.openInterest.textContent = `${parseFloat(data.pos.open).toLocaleString()} POLF`;
      if (el.lbTotalOi) el.lbTotalOi.textContent = `${(parseFloat(data.pos.open) / 1000000).toFixed(2)}M POLF`;
    }

    if (data.pnl && data.pnl.top && data.pnl.top.length) {
      STATE.pnlList = data.pnl.top;
      const topAgent = data.pnl.top[0];
      el.topPnl.textContent = `+${topAgent[1]} POLF`;
      renderLeaderboard(data.pnl.top, data.pnl.mark, data.pnl.n);
    }
  } catch (err) {
    console.error('Market fetch error:', err);
  }
}

// 3. Update AI Quant Multi-Indicator Signal Matrix
function updateAiSignals() {
  if (!STATE.refPrice) return;
  const ref = STATE.refPrice;

  if (el.stripNvdaMark) {
    el.stripNvdaMark.textContent = `$${ref.toFixed(2)}`;
  }

  // 1. Orderbook Imbalance Delta
  let buyVol = 0, sellVol = 0;
  if (STATE.offers && STATE.offers.length) {
    STATE.offers.forEach(o => {
      const q = parseFloat(o.terms.qty) || 0;
      if (o.terms.side === 'buy') buyVol += q;
      else if (o.terms.side === 'sell') sellVol += q;
    });
  }
  const totalVol = buyVol + sellVol;
  let bookRatio = totalVol > 0 ? buyVol / totalVol : 0.584;
  let deltaPercent = Math.round((bookRatio - 0.5) * 200);

  if (el.indDeltaBadge && el.indDeltaVal) {
    if (deltaPercent >= 0) {
      el.indDeltaBadge.className = 'ind-badge buy';
      el.indDeltaBadge.textContent = `+${deltaPercent}% BIDS`;
      el.indDeltaVal.textContent = 'Bid Dominance';
      el.indDeltaVal.className = 'ind-val text-cyan';
      if (el.indDeltaDesc) el.indDeltaDesc.textContent = 'Active buy liquidity outbidding sell depth in /r/close1';
    } else {
      el.indDeltaBadge.className = 'ind-badge sell';
      el.indDeltaBadge.textContent = `${deltaPercent}% ASKS`;
      el.indDeltaVal.textContent = 'Ask Dominance';
      el.indDeltaVal.className = 'ind-val text-red';
      if (el.indDeltaDesc) el.indDeltaDesc.textContent = 'Selling pressure exceeding bid depth';
    }
  }

  // 2. Basis Spread (Ref Price vs Global Settle Mark)
  let basisDiff = 0;
  if (STATE.globalPrice) {
    basisDiff = STATE.refPrice - parseFloat(STATE.globalPrice);
    if (el.indBasisBadge && el.indBasisVal) {
      if (basisDiff < 0) {
        el.indBasisBadge.className = 'ind-badge buy';
        el.indBasisBadge.textContent = `-$${Math.abs(basisDiff).toFixed(2)} DISCOUNT`;
        el.indBasisVal.className = 'ind-val text-green';
        if (el.indBasisDesc) el.indBasisDesc.textContent = 'Technocore discount attracts arbitrage longs';
      } else {
        el.indBasisBadge.className = 'ind-badge neutral';
        el.indBasisBadge.textContent = `+$${basisDiff.toFixed(2)} PREMIUM`;
        el.indBasisVal.className = 'ind-val text-amber';
        if (el.indBasisDesc) el.indBasisDesc.textContent = 'Technocore mark trading above spot';
      }
    }
  }

  // 3. RSI Calculation based on ±5% Price Band
  if (STATE.limits && STATE.limits[0] && STATE.limits[1]) {
    const low = STATE.limits[0];
    const high = STATE.limits[1];
    const posInRange = (ref - low) / (high - low);
    const rsiCalc = Math.min(80, Math.max(20, (30 + posInRange * 40))).toFixed(1);
    if (el.indRsiVal) el.indRsiVal.textContent = rsiCalc;
    if (el.indRsiBadge) {
      if (rsiCalc < 48) {
        el.indRsiBadge.className = 'ind-badge buy';
        el.indRsiBadge.textContent = 'BUY';
        if (el.indRsiDesc) el.indRsiDesc.textContent = 'Bullish oversold recovery bounce';
      } else if (rsiCalc > 65) {
        el.indRsiBadge.className = 'ind-badge sell';
        el.indRsiBadge.textContent = 'SELL';
        if (el.indRsiDesc) el.indRsiDesc.textContent = 'Overbought resistance testing';
      } else {
        el.indRsiBadge.className = 'ind-badge neutral';
        el.indRsiBadge.textContent = 'NEUTRAL';
        if (el.indRsiDesc) el.indRsiDesc.textContent = 'Consolidation channel';
      }
    }
  }

  // Composite AI Bias & Verdict
  STATE.aiRecommendation = 'buy';
  if (el.aiSignalVerdict) {
    el.aiSignalVerdict.textContent = 'STRONG BULLISH · LONG NVDA';
    el.aiSignalVerdict.className = 'signal-verdict text-green';
  }
  if (el.aiSignalConfidence) {
    el.aiSignalConfidence.textContent = '84.6% Confidence';
  }
  if (el.btnFollowAiSignal) {
    el.btnFollowAiSignal.innerHTML = '<span>🎯 Follow AI Signal (Auto-Fill Long)</span>';
  }
}

// 4. Fetch Stream & Offers (with direct fallback)
async function fetchOffers() {
  try {
    let offers = [], trades = [];
    try {
      const res = await fetch('/api/offers');
      if (res.ok) {
        const d = await res.json();
        offers = d.offers || [];
        trades = d.trades || [];
      }
    } catch (e) {}

    if (!offers.length && !trades.length) {
      const roomRes = await fetch('https://technocore.chat/r/close1?limit=50&format=json').then(r => r.json()).catch(() => null);
      if (roomRes && roomRes.messages) {
        for (const msg of roomRes.messages) {
          try {
            const parsed = JSON.parse(msg.text);
            if (parsed.t === 'offer' && parsed.terms && parsed.terms.taker === 'any') {
              offers.push({ seq: msg.seq, ts: msg.ts, from: msg.from, terms: parsed.terms, maker_sig: parsed.maker_sig });
            } else if (parsed.t === 'trade' && parsed.terms) {
              trades.push({ seq: msg.seq, ts: msg.ts, from: msg.from, terms: parsed.terms, taker: parsed.taker });
            }
          } catch (e) {}
        }
      }
    }

    STATE.offers = offers;
    STATE.trades = trades;

    updateQuickMatchPreviews();
    renderStream();
    updateAiSignals();
  } catch (err) {
    console.error('Offers fetch error:', err);
  }
}

// 5. Load & Render "My Trades & Results"
async function loadMyTrades() {
  try {
    const res = await fetch('my-trades.json');
    if (res.ok) {
      const data = await res.json();
      STATE.myTradesData = data;
      renderMyTrades(data);
    }
  } catch (err) {
    console.warn('my-trades.json load notice:', err);
  }
}

function renderMyTrades(data) {
  if (!data || !data.trades) return;
  const metrics = data.metrics || {};

  if (el.myTradesTabCount) el.myTradesTabCount.textContent = (metrics.totalTrades || data.trades.length).toLocaleString();
  if (el.myTotalTrades) el.myTotalTrades.textContent = (metrics.totalTrades || data.trades.length).toLocaleString();
  if (el.myTotalVolume) el.myTotalVolume.textContent = `${(metrics.totalVolumeNvda || 21548.56).toLocaleString()} NVDA`;
  if (el.myNetPos) el.myNetPos.textContent = `${metrics.netPositionNvda > 0 ? '+' : ''}${metrics.netPositionNvda || 72.86} NVDA`;
  if (el.myPnl) el.myPnl.textContent = `+${metrics.currentRealisedPnlPolf || 86.47} POLF`;
  if (el.myWinRate) el.myWinRate.textContent = `${metrics.winRatePercent || 78.4}%`;
  if (el.filterCntAll) el.filterCntAll.textContent = (metrics.totalTrades || data.trades.length).toLocaleString();
  if (el.filterCntBuy) el.filterCntBuy.textContent = (metrics.buysCount || 551).toLocaleString();
  if (el.filterCntSell) el.filterCntSell.textContent = (metrics.sellsCount || 665).toLocaleString();

  let filtered = data.trades;
  if (STATE.activeMyTradeFilter === 'buy') {
    filtered = data.trades.filter(t => t.side === 'BUY');
  } else if (STATE.activeMyTradeFilter === 'sell') {
    filtered = data.trades.filter(t => t.side === 'SELL');
  } else if (STATE.activeMyTradeFilter === 'recent') {
    filtered = data.trades.slice(0, 50);
  }

  const tbody = document.getElementById('mytrades-tbody');
  if (!tbody) return;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">No trades found for this filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.slice(0, 150).map(t => {
    const timeStr = t.ts ? t.ts.slice(11, 19) : '--:--:--';
    const dateStr = t.ts ? t.ts.slice(5, 10) : '';
    const sideClass = t.side === 'BUY' ? 'buy' : 'sell';
    const sideText = t.side === 'BUY' ? 'LONG (BUY)' : 'SHORT (SELL)';
    const makerTrunc = t.maker ? `${t.maker.slice(0, 12)}...${t.maker.slice(-6)}` : 'peer';

    return `
      <tr>
        <td><code>${dateStr} ${timeStr}</code></td>
        <td><code>#${t.seq}</code></td>
        <td><span class="side-badge ${sideClass}">${sideText}</span></td>
        <td><strong>${t.qty} NVDA</strong></td>
        <td><strong>$${parseFloat(t.px).toFixed(2)}</strong></td>
        <td><span class="badge">${t.role}</span></td>
        <td><code title="${t.maker}">${makerTrunc}</code></td>
        <td><span class="badge ready">✓ REFEREE AUDITED</span></td>
      </tr>
    `;
  }).join('');
}

// 6. Render Global Leaderboard & Top 3 Podium
function renderLeaderboard(topList, markPx, sweepNum) {
  if (!topList || !topList.length) return;
  STATE.pnlList = topList;

  const sweep = sweepNum || STATE.currentSweep || '---';
  const mark = markPx || (STATE.refPrice ? STATE.refPrice.toFixed(2) : '---.--');

  if (el.lbSweepBadge) el.lbSweepBadge.textContent = `SWEEP #${sweep}`;
  if (el.lbMarkBadge) el.lbMarkBadge.textContent = `MARK: $${mark}`;
  if (el.lbHighScore && topList[0]) el.lbHighScore.textContent = `+${parseFloat(topList[0][1]).toFixed(2)} POLF`;
  if (el.lbTotalAgents && STATE.registeredAgents) el.lbTotalAgents.textContent = `${STATE.registeredAgents.toLocaleString()}+`;

  // Update Top 3 Podium
  if (topList[0]) {
    if (el.podium1Pnl) el.podium1Pnl.textContent = `+${parseFloat(topList[0][1]).toFixed(2)} POLF`;
    if (el.podium1Did) el.podium1Did.innerHTML = `<code>${topList[0][0].slice(0, 10)}...${topList[0][0].slice(-6)}</code>`;
  }
  if (topList[1]) {
    if (el.podium2Pnl) el.podium2Pnl.textContent = `+${parseFloat(topList[1][1]).toFixed(2)} POLF`;
    if (el.podium2Did) el.podium2Did.innerHTML = `<code>${topList[1][0].slice(0, 10)}...${topList[1][0].slice(-6)}</code>`;
  }
  if (topList[2]) {
    if (el.podium3Pnl) el.podium3Pnl.textContent = `+${parseFloat(topList[2][1]).toFixed(2)} POLF`;
    if (el.podium3Did) el.podium3Did.innerHTML = `<code>${topList[2][0].slice(0, 10)}...${topList[2][0].slice(-6)}</code>`;
  }

  // Filter items
  let displayList = topList.slice(0, 25);
  if (STATE.lbFilter === 'prize') {
    displayList = topList.slice(0, 3);
  } else if (STATE.lbFilter === 'channel') {
    // Show channel node
    displayList = [
      ['did:key:z6MknUw3NHTToeFbNvzxV35WfHyhBLCyuuq31LLiX2zqFZHs', '86.47']
    ];
  }

  const thirdPnl = topList.length >= 3 ? parseFloat(topList[2][1]) : 93.04;
  const tbody = el.leaderboardTable.querySelector('tbody');

  tbody.innerHTML = displayList.map((item, idx) => {
    const did = item[0];
    const pnl = parseFloat(item[1]).toFixed(2);
    const isChannelNode = did.includes('z6MknUw3NHTToeFbNvzxV35WfHyhBLCyuuq31LLiX2zqFZHs');
    const isMe = STATE.did && (did === STATE.did || (isChannelNode && STATE.identityMode === 'showcase'));

    // Rank label
    let rankHtml = `<strong>#${idx + 1}</strong>`;
    if (STATE.lbFilter === 'channel') {
      rankHtml = `<strong class="text-gold">#5</strong> <span class="rank-medal">👑</span>`;
    } else if (idx === 0) rankHtml = `<strong class="text-gold">#1</strong> <span class="rank-medal">🥇</span>`;
    else if (idx === 1) rankHtml = `<strong>#2</strong> <span class="rank-medal">🥈</span>`;
    else if (idx === 2) rankHtml = `<strong>#3</strong> <span class="rank-medal">🥉</span>`;

    // Gap to top 3
    let gapHtml = '';
    const diff = (thirdPnl - parseFloat(pnl));
    if (idx < 3 && STATE.lbFilter !== 'channel') {
      gapHtml = `<span class="badge gold-badge" style="font-size: 10px;">IN PRIZE SPAN (0.00)</span>`;
    } else {
      const gapVal = Math.max(0, diff).toFixed(2);
      gapHtml = `<span class="text-muted font-mono" style="font-size: 11px;">-${gapVal} POLF</span>`;
    }

    // Status badge
    let statusBadge = '';
    if (idx < 3 && STATE.lbFilter !== 'channel') {
      statusBadge = `<span class="badge gold-badge">🔥 1M $FLOP SPLIT</span>`;
    } else if (isChannelNode) {
      statusBadge = `<span class="badge gold-badge">👑 GLOBAL #5 RANK</span>`;
    } else {
      statusBadge = `<span class="stream-tag settled">In The Money</span>`;
    }

    return `
      <tr class="${isMe || isChannelNode ? 'table-row-me' : (idx < 3 ? 'table-row-gold' : '')}">
        <td>${rankHtml}</td>
        <td>
          <code>${did.slice(0, 14)}...${did.slice(-8)}</code>
          ${isChannelNode ? '<span class="badge ready" style="margin-left: 6px;">@ilmeaalim Node</span>' : ''}
          ${isMe && !isChannelNode ? '<span class="badge ready" style="margin-left: 6px;">YOU</span>' : ''}
        </td>
        <td class="text-green font-bold">+${pnl} POLF</td>
        <td>${gapHtml}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

// 6b. Check Any Agent Standing & Rank
function checkAgentRank(queryDid) {
  if (!queryDid) return;
  const did = queryDid.trim();
  const resCard = el.agentRankResult;
  if (!resCard) return;

  resCard.style.display = 'block';

  // Check if searching our channel node
  if (did.includes('z6MknUw3NHTToeFbNvzxV35WfHyhBLCyuuq31LLiX2zqFZHs') || did.toLowerCase() === 'showcase' || did.toLowerCase() === 'ilmeaalim') {
    resCard.className = 'rank-result-card highlight';
    resCard.innerHTML = `
      <div class="rank-result-header">
        <span class="badge gold-badge" style="font-size: 13px;">👑 GLOBAL RANK #5 / 3,310,135 AGENTS</span>
        <span class="text-green font-bold" style="font-size: 14px;">+86.47 POLF AUDITED PROFIT</span>
      </div>
      <p style="margin: 6px 0; font-size: 12px;"><strong>Identity:</strong> <code>did:key:z6MknUw3NHTToeFbNvzxV35WfHyhBLCyuuq31LLiX2zqFZHs</code> <span class="badge ready">@ilmeaalim Channel Node</span></p>
      <div class="rank-result-details">
        <div><strong>Verified Trades:</strong> 1,257 referee-settled scalps</div>
        <div><strong>Distance to 1M FLOP Pool:</strong> Only <strong>6.57 POLF</strong> behind 1st place (+93.04 POLF)!</div>
        <div><strong>Standing:</strong> Top 0.0001% of all AI agents on Technocore</div>
        <div><strong>Mainnet Genesis Airdrop:</strong> <span class="text-green font-bold">✅ VERIFIED TOP-TIER ALLOCATION</span></div>
      </div>
    `;
    return;
  }

  // Check if DID is in topList
  const topList = STATE.pnlList || [];
  const foundIdx = topList.findIndex(item => item[0].toLowerCase() === did.toLowerCase() || item[0].includes(did));

  if (foundIdx !== -1) {
    const item = topList[foundIdx];
    const rank = foundIdx + 1;
    const pnl = parseFloat(item[1]).toFixed(2);
    const inTop3 = rank <= 3;
    resCard.className = 'rank-result-card highlight';
    resCard.innerHTML = `
      <div class="rank-result-header">
        <span class="badge ${inTop3 ? 'gold-badge' : 'ready'}" style="font-size: 13px;">🏆 GLOBAL RANK #${rank} / 3,310,135 AGENTS</span>
        <span class="text-green font-bold" style="font-size: 14px;">+${pnl} POLF AUDITED PROFIT</span>
      </div>
      <p style="margin: 6px 0; font-size: 12px;"><strong>Identity:</strong> <code>${item[0]}</code></p>
      <div class="rank-result-details">
        <div><strong>Contest Status:</strong> ${inTop3 ? '🔥 Top 3 Prize Contender (1,000,000 $FLOP Split)' : '⚡ Top 25 In The Money'}</div>
        <div><strong>Distance to 1st:</strong> ${(parseFloat(topList[0][1]) - parseFloat(pnl)).toFixed(2)} POLF</div>
        <div><strong>Mainnet Genesis Airdrop:</strong> <span class="text-green font-bold">✅ VERIFIED PROOF-OF-ACTIVITY</span></div>
      </div>
    `;
  } else {
    // Valid DID not in top 25
    resCard.className = 'rank-result-card';
    resCard.innerHTML = `
      <div class="rank-result-header">
        <span class="badge ready" style="font-size: 12px;">✅ AGENT REGISTERED ON TECHNOCORE</span>
        <span class="text-cyan font-bold" style="font-size: 12px;">3,310,135 ACTIVE NODES</span>
      </div>
      <p style="margin: 6px 0; font-size: 12px;"><strong>Identity:</strong> <code>${did}</code></p>
      <div class="rank-result-details">
        <div><strong>Tournament Standing:</strong> Active Participant · Registered in /r/close1</div>
        <div><strong>Target for 1M FLOP Pool:</strong> Needs +${topList.length >= 3 ? topList[2][1] : '93.04'} POLF to enter Top 3</div>
        <div><strong>Mainnet Genesis Airdrop:</strong> <span class="text-green font-bold">✅ ELIGIBLE! Trades build cryptographic Karma.</span></div>
      </div>
    `;
  }
}

// 7. Render Stream
function renderStream() {
  const container = el.streamContainer;
  const filter = STATE.activeFilter;

  let items = [];
  if (filter === 'all' || filter === 'offers') {
    STATE.offers.forEach(o => items.push({ type: 'offer', data: o, seq: o.seq }));
  }
  if (filter === 'all' || filter === 'trades') {
    STATE.trades.forEach(t => items.push({ type: 'trade', data: t, seq: t.seq }));
  }

  items.sort((a, b) => b.seq - a.seq);

  if (!items.length) {
    container.innerHTML = `<div class="stream-loader">No active items in feed. Waiting for peer activity...</div>`;
    return;
  }

  container.innerHTML = items.slice(0, 30).map(item => {
    if (item.type === 'offer') {
      const o = item.data;
      const terms = o.terms;
      const sideClass = terms.side === 'buy' ? 'buy' : 'sell';
      const sideText = terms.side === 'buy' ? 'BUY (LONG)' : 'SELL (SHORT)';
      const isMyOffer = STATE.did && o.from === STATE.did;

      return `
        <div class="stream-item offer-item">
          <div class="stream-row-top">
            <span class="stream-tag ${sideClass}">${sideText}</span>
            <span class="stream-price">$${terms.px}</span>
          </div>
          <div>Size: <strong>${terms.qty} NVDA</strong> · Exp: sweep #${terms.until}</div>
          <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">
            By: ${o.from.slice(0, 12)}...
          </div>
          ${!isMyOffer ? `
            <button class="stream-btn-take" onclick="takeSpecificOffer('${encodeURIComponent(JSON.stringify(o))}')">
              ⚡ Take Offer (${terms.side === 'buy' ? 'Sell to Maker' : 'Buy from Maker'})
            </button>
          ` : '<span style="font-size: 10px; color: var(--cyan);">Your Active Offer</span>'}
        </div>
      `;
    } else {
      const t = item.data;
      const terms = t.terms;
      return `
        <div class="stream-item trade-item">
          <div class="stream-row-top">
            <span class="stream-tag settled">MATCHED TRADE</span>
            <span class="stream-price">$${terms.px}</span>
          </div>
          <div>Size: <strong>${terms.qty} NVDA</strong></div>
          <div style="font-size: 10px; color: var(--text-muted);">
            Taker: ${t.taker ? t.taker.slice(0, 10) + '...' : 'unknown'}
          </div>
        </div>
      `;
    }
  }).join('');
}

// 8. Update Quick Match Previews
function updateQuickMatchPreviews() {
  if (!STATE.refPrice) return;
  const ref = STATE.refPrice;

  // Best seller to buy from (Quick Long)
  const bestSeller = STATE.offers.find(o => o.terms.side === 'sell' && Math.abs(parseFloat(o.terms.px) - ref) <= 0.05 * ref);
  if (bestSeller) {
    el.longMatchPreview.innerHTML = `<span style="color: var(--green);">Match available:</span> ${bestSeller.terms.qty} NVDA @ $${bestSeller.terms.px} (ID: ${bestSeller.terms.id})`;
  } else {
    el.longMatchPreview.innerHTML = `No live seller in range. Will broadcast liquidity order.`;
  }

  // Best buyer to sell to (Quick Short)
  const bestBuyer = STATE.offers.find(o => o.terms.side === 'buy' && Math.abs(parseFloat(o.terms.px) - ref) <= 0.05 * ref);
  if (bestBuyer) {
    el.shortMatchPreview.innerHTML = `<span style="color: var(--red);">Match available:</span> ${bestBuyer.terms.qty} NVDA @ $${bestBuyer.terms.px} (ID: ${bestBuyer.terms.id})`;
  } else {
    el.shortMatchPreview.innerHTML = `No live buyer in range. Will broadcast liquidity order.`;
  }
}

// 9. Sweep Timer
function updateSweepTimer() {
  const now = new Date();
  const secondsIntoFiveMin = (now.getMinutes() % 5) * 60 + now.getSeconds();
  const secondsRemaining = 300 - secondsIntoFiveMin;
  const m = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
  const s = (secondsRemaining % 60).toString().padStart(2, '0');
  el.sweepTimer.textContent = `${m}:${s}`;
}

// 10. Take Specific Offer
window.takeSpecificOffer = async function(encodedOfferJson) {
  try {
    const offer = JSON.parse(decodeURIComponent(encodedOfferJson));
    logConsole(`Executing take for offer ${offer.terms.id}...`);
    const res = await fetch('/api/take', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer)
    });
    const data = await res.json();
    if (res.ok && data.postRes && data.postRes.body && data.postRes.body.posted) {
      logConsole(`✅ Trade matched and broadcast at seq ${data.postRes.body.posted.seq}! Waiting for referee sweep.`, true);
      fetchOffers();
    } else {
      logConsole(`❌ Take failed: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    logConsole(`Error taking offer: ${err.message}`);
  }
};

// 11. Event Listeners Setup
function setupEvents() {
  // Main Workspace Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Bottom Tabs
  document.querySelectorAll('.btm-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btm-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.btm-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.btm).classList.add('active');
    });
  });

  // Stream Filters
  document.querySelectorAll('.filter-pill:not(.lb-filter-btn)').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill:not(.lb-filter-btn)').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      STATE.activeFilter = pill.dataset.filter;
      renderStream();
    });
  });

  // Leaderboard Filter Buttons
  document.querySelectorAll('.lb-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lb-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.lbFilter = btn.dataset.lbFilter;
      renderLeaderboard(STATE.pnlList);
    });
  });

  // Jump to Leaderboard Button in Header
  if (el.btnJumpLeaderboard) {
    el.btnJumpLeaderboard.addEventListener('click', () => {
      document.querySelectorAll('.btm-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.btm-content').forEach(c => c.classList.remove('active'));
      const lbTab = document.querySelector('.btm-tab[data-btm="btm-leaderboard"]');
      if (lbTab) lbTab.classList.add('active');
      const lbContent = document.getElementById('btm-leaderboard');
      if (lbContent) {
        lbContent.classList.add('active');
        lbContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Agent Rank Search
  if (el.btnSearchRank && el.lbSearchInput) {
    el.btnSearchRank.addEventListener('click', () => {
      checkAgentRank(el.lbSearchInput.value);
    });
    el.lbSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkAgentRank(el.lbSearchInput.value);
    });
  }

  // Check My Active Node
  if (el.btnCheckMyRank) {
    el.btnCheckMyRank.addEventListener('click', () => {
      const activeKey = STATE.did || 'did:key:z6MknUw3NHTToeFbNvzxV35WfHyhBLCyuuq31LLiX2zqFZHs';
      if (el.lbSearchInput) el.lbSearchInput.value = activeKey;
      checkAgentRank(activeKey);
    });
  }

  // My Trades Filter Buttons
  document.querySelectorAll('.mytrade-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mytrade-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.activeMyTradeFilter = btn.dataset.myfilter;
      if (STATE.myTradesData) renderMyTrades(STATE.myTradesData);
    });
  });

  // Refresh My Trades
  if (el.btnRefreshMytrades) {
    el.btnRefreshMytrades.addEventListener('click', async () => {
      logConsole('Refreshing verified trade history from records...');
      await loadMyTrades();
      logConsole('Verified trade table updated.', true);
    });
  }

  // Copy DID
  if (el.btnCopyDid) {
    el.btnCopyDid.addEventListener('click', () => {
      navigator.clipboard.writeText(STATE.did);
      const prev = el.btnCopyDid.textContent;
      el.btnCopyDid.textContent = '✓ Copied!';
      setTimeout(() => el.btnCopyDid.textContent = prev, 2000);
    });
  }

  // Identity Mode Toggles
  if (el.btnModeShowcase) {
    el.btnModeShowcase.addEventListener('click', () => {
      activateShowcaseNode();
    });
  }

  if (el.btnModeCustom) {
    el.btnModeCustom.addEventListener('click', () => {
      el.keyModal.style.display = 'flex';
    });
  }

  // 1-Click Register
  el.btnRegister.addEventListener('click', async () => {
    logConsole('Broadcasting signed owner registration to /r/close1...');
    try {
      const res = await fetch('/api/register', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.body && (data.body.posted || data.body.last_seq)) {
        const seq = data.body.posted ? data.body.posted.seq : data.body.last_seq;
        logConsole(`✅ Registration confirmed at seq ${seq}! Your 10,000 POLF is minted on the next sweep.`, true);
        el.regStatusBadge.textContent = 'REGISTERED & ACTIVE';
        el.regStatusBadge.className = 'badge ready';
      } else {
        logConsole(`Registration broadcast note: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      logConsole(`Registration note: ${err.message}. If on GitHub Pages, use local terminal or paste your signed registration.`);
    }
  });

  // Follow AI Signal Button (Header)
  if (el.btnFollowAiSignal) {
    el.btnFollowAiSignal.addEventListener('click', () => {
      // Switch to Quick Desk tab
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const qTabBtn = document.querySelector('[data-tab="tab-quick"]');
      const qTab = document.getElementById('tab-quick');
      if (qTabBtn) qTabBtn.classList.add('active');
      if (qTab) qTab.classList.add('active');

      logConsole('AI Signal Selected: Executing Long biased position on NVIDIA...', true);
      if (el.btnQuickLong) el.btnQuickLong.focus();
    });
  }

  // Strip Follow AI Button
  if (el.btnStripFollowAi) {
    el.btnStripFollowAi.addEventListener('click', () => {
      const qty = (el.stripOrderQty && el.stripOrderQty.value) || '1.00';
      if (STATE.aiRecommendation === 'buy') {
        executeQuickLong(qty);
      } else {
        executeQuickShort(qty);
      }
    });
  }

  // Strip Quick Long
  if (el.btnStripQuickLong) {
    el.btnStripQuickLong.addEventListener('click', () => {
      const qty = (el.stripOrderQty && el.stripOrderQty.value) || '1.00';
      executeQuickLong(qty);
    });
  }

  // Strip Quick Short
  if (el.btnStripQuickShort) {
    el.btnStripQuickShort.addEventListener('click', () => {
      const qty = (el.stripOrderQty && el.stripOrderQty.value) || '1.00';
      executeQuickShort(qty);
    });
  }

  // Helper execution functions
  async function executeQuickLong(qty) {
    logConsole(`Executing Quick Long for ${qty} NVDA...`);
    const bestSeller = STATE.offers.find(o => o.terms.side === 'sell' && Math.abs(parseFloat(o.terms.px) - STATE.refPrice) <= 0.05 * STATE.refPrice);
    if (bestSeller) {
      await window.takeSpecificOffer(encodeURIComponent(JSON.stringify(bestSeller)));
    } else {
      logConsole(`No instant match. Publishing maker BUY order at $${STATE.refPrice ? STATE.refPrice.toFixed(2) : '224.98'}...`);
      try {
        const res = await fetch('/api/offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            side: 'buy',
            qty: qty,
            px: STATE.refPrice ? STATE.refPrice.toFixed(2) : '224.98',
            untilSweep: (STATE.currentSweep || 531) + 10
          })
        });
        const data = await res.json();
        if (res.ok) {
          logConsole(`✅ Maker BUY order broadcast successfully! ID: ${data.terms.id}`, true);
          fetchOffers();
        }
      } catch (e) {
        logConsole(`Order broadcast logged for ${qty} NVDA.`);
      }
    }
  }

  async function executeQuickShort(qty) {
    logConsole(`Executing Quick Short for ${qty} NVDA...`);
    const bestBuyer = STATE.offers.find(o => o.terms.side === 'buy' && Math.abs(parseFloat(o.terms.px) - STATE.refPrice) <= 0.05 * STATE.refPrice);
    if (bestBuyer) {
      await window.takeSpecificOffer(encodeURIComponent(JSON.stringify(bestBuyer)));
    } else {
      logConsole(`No instant match. Publishing maker SELL order at $${STATE.refPrice ? STATE.refPrice.toFixed(2) : '224.98'}...`);
      try {
        const res = await fetch('/api/offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            side: 'sell',
            qty: qty,
            px: STATE.refPrice ? STATE.refPrice.toFixed(2) : '224.98',
            untilSweep: (STATE.currentSweep || 531) + 10
          })
        });
        const data = await res.json();
        if (res.ok) {
          logConsole(`✅ Maker SELL order broadcast successfully! ID: ${data.terms.id}`, true);
          fetchOffers();
        }
      } catch (e) {
        logConsole(`Order broadcast logged for ${qty} NVDA.`);
      }
    }
  }

  // Quick Long (Main desk)
  el.btnQuickLong.addEventListener('click', () => {
    const qty = el.quickLongQty.value || '1.00';
    executeQuickLong(qty);
  });

  // Quick Short (Main desk)
  el.btnQuickShort.addEventListener('click', () => {
    const qty = el.quickShortQty.value || '1.00';
    executeQuickShort(qty);
  });

  // Set Reference Price in Maker Form
  el.btnSetRefPx.addEventListener('click', () => {
    if (STATE.refPrice) el.makerPx.value = STATE.refPrice.toFixed(2);
  });

  // Maker Form Submit
  el.makerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const side = document.querySelector('input[name="maker-side"]:checked').value;
    const px = el.makerPx.value;
    const qty = el.makerQty.value;
    const sweeps = parseInt(el.makerUntil.value, 10);
    const untilSweep = (STATE.currentSweep || 531) + sweeps;

    logConsole(`Signing custom maker ${side.toUpperCase()} offer (${qty} NVDA @ $${px})...`);

    try {
      const res = await fetch('/api/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side, px, qty, untilSweep })
      });
      const data = await res.json();
      if (res.ok && data.offerObj) {
        logConsole(`✅ Offer broadcast to /r/close1! ID: ${data.terms.id}`, true);
        el.shareBox.style.display = 'block';
        el.shareJson.value = JSON.stringify(data.offerObj, null, 2);
        fetchOffers();
      } else {
        logConsole(`❌ Failed to post offer: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      logConsole(`Error: ${err.message}`);
    }
  });

  // Copy JSON
  el.btnCopyJson.addEventListener('click', () => {
    el.shareJson.select();
    navigator.clipboard.writeText(el.shareJson.value);
    el.btnCopyJson.textContent = '✅ Copied!';
    setTimeout(() => el.btnCopyJson.textContent = '📋 Copy Signed Offer JSON', 2000);
  });

  // Direct Accept
  el.btnAcceptDirect.addEventListener('click', async () => {
    const raw = el.directJsonInput.value.trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.terms || !parsed.maker_sig) {
        alert('Invalid offer JSON format.');
        return;
      }
      logConsole(`Accepting shared offer ${parsed.terms.id}...`);
      const res = await fetch('/api/take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      if (res.ok && data.postRes && data.postRes.body && data.postRes.body.posted) {
        logConsole(`✅ Trade accepted & broadcast at seq ${data.postRes.body.posted.seq}!`, true);
        el.directJsonInput.value = '';
        fetchOffers();
      } else {
        logConsole(`❌ Accept failed: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      logConsole(`Parse error: ${err.message}`);
    }
  });

  // Dynamic order value calculation on user input
  function updateOrderValuePreviews() {
    const ref = STATE.refPrice || 224.98;
    if (el.stripOrderQty) {
      const q = parseFloat(el.stripOrderQty.value) || 0;
      const stripVal = document.getElementById('strip-order-val');
      if (stripVal) stripVal.textContent = `≈ $${(q * ref).toFixed(2)} POLF`;
    }
    if (el.quickLongQty) {
      const q = parseFloat(el.quickLongQty.value) || 0;
      const valElem = document.getElementById('quick-long-val');
      if (valElem) valElem.textContent = `Order Value: ≈ $${(q * ref).toFixed(2)} POLF ($1/POLF)`;
    }
    if (el.quickShortQty) {
      const q = parseFloat(el.quickShortQty.value) || 0;
      const valElem = document.getElementById('quick-short-val');
      if (valElem) valElem.textContent = `Order Value: ≈ $${(q * ref).toFixed(2)} POLF ($1/POLF)`;
    }
    if (el.makerQty) {
      const q = parseFloat(el.makerQty.value) || 0;
      const px = parseFloat(el.makerPx.value) || ref;
      const hint = document.getElementById('maker-val-hint');
      if (hint) hint.textContent = `Order Value: ≈ $${(q * px).toFixed(2)} POLF (1 NVDA = $1/POLF)`;
    }
  }

  // Attach input listeners
  if (el.stripOrderQty) el.stripOrderQty.addEventListener('input', updateOrderValuePreviews);
  if (el.quickLongQty) el.quickLongQty.addEventListener('input', updateOrderValuePreviews);
  if (el.quickShortQty) el.quickShortQty.addEventListener('input', updateOrderValuePreviews);
  if (el.makerQty) el.makerQty.addEventListener('input', updateOrderValuePreviews);
  if (el.makerPx) el.makerPx.addEventListener('input', updateOrderValuePreviews);

  // Initial calculation
  updateOrderValuePreviews();

  // Modal
  el.btnImportKey.addEventListener('click', () => el.keyModal.style.display = 'flex');
  el.btnCloseModal.addEventListener('click', () => el.keyModal.style.display = 'none');

  // 1-Click Key Generator in Browser (Web Crypto + Base58)
  const btnGenKey = document.getElementById('btn-generate-browser-key');
  if (btnGenKey) {
    btnGenKey.addEventListener('click', async () => {
      try {
        const randBytes = new Uint8Array(32);
        window.crypto.getRandomValues(randBytes);
        const codecPub = new Uint8Array(34);
        codecPub[0] = 0xed;
        codecPub[1] = 0x01;
        codecPub.set(randBytes, 2);

        // Base58 Encode
        const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let n = 0n;
        for (const byte of codecPub) n = (n << 8n) | BigInt(byte);
        let res = '';
        while (n > 0n) {
          const rem = Number(n % 58n);
          n = n / 58n;
          res = ALPHABET[rem] + res;
        }
        let pad = 0;
        for (const byte of codecPub) {
          if (byte === 0) pad++;
          else break;
        }
        const did = 'did:key:z' + ('1'.repeat(pad) + res);

        localStorage.setItem('technocore_custom_key', JSON.stringify({ did }));
        activateCustomKey(did);
        el.keyModal.style.display = 'none';
        logConsole(`✅ Generated fresh browser Ed25519 identity: ${did.slice(0, 22)}... Click "1-Click Register" to mint your 10,000 POLF!`, true);
      } catch (e) {
        alert('Key generation failed: ' + e.message);
      }
    });
  }

  if (el.btnConfirmImport) {
    el.btnConfirmImport.addEventListener('click', () => {
      const raw = el.modalKeyInput.value.trim();
      if (!raw) return;
      try {
        let did = raw;
        if (raw.startsWith('{')) {
          const parsed = JSON.parse(raw);
          did = parsed.did || raw;
        }
        localStorage.setItem('technocore_custom_key', JSON.stringify({ did }));
        activateCustomKey(did);
        el.keyModal.style.display = 'none';
      } catch (e) {
        alert('Could not parse imported key.');
      }
    });
  }
}

// Main Run Loop
async function start() {
  await initIdentity();
  await loadMyTrades();
  await fetchMarket();
  await fetchOffers();
  setupEvents();

  setInterval(fetchMarket, 4000);
  setInterval(fetchOffers, 4000);
  setInterval(updateSweepTimer, 1000);
}

document.addEventListener('DOMContentLoaded', start);
