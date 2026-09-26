/**
 * Technocore Close Call Terminal — Frontend Application Logic
 */

const STATE = {
  did: null,
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
  activeFilter: 'all'
};

// UI Elements
const el = {
  networkStatus: document.getElementById('network-status'),
  currentSweepBadge: document.getElementById('current-sweep-badge'),
  sweepTimer: document.getElementById('sweep-timer'),
  refPrice: document.getElementById('ref-price'),
  allowedLimits: document.getElementById('allowed-limits'),
  globalPrice: document.getElementById('global-price'),
  registeredAgents: document.getElementById('registered-agents'),
  openInterest: document.getElementById('open-interest'),
  topPnl: document.getElementById('top-pnl'),
  activeDid: document.getElementById('active-did'),
  regStatusBadge: document.getElementById('reg-status-badge'),
  btnRegister: document.getElementById('btn-register'),
  btnImportKey: document.getElementById('btn-import-key'),
  guardLow: document.getElementById('guard-low'),
  guardMid: document.getElementById('guard-mid'),
  guardHigh: document.getElementById('guard-high'),
  guardPin: document.getElementById('guard-pin'),
  quickLongQty: document.getElementById('quick-long-qty'),
  quickShortQty: document.getElementById('quick-short-qty'),
  btnQuickLong: document.getElementById('btn-quick-long'),
  btnQuickShort: document.getElementById('btn-quick-short'),
  longMatchPreview: document.getElementById('long-match-preview'),
  shortMatchPreview: document.getElementById('short-match-preview'),
  terminalConsole: document.getElementById('terminal-console'),
  makerForm: document.getElementById('maker-form'),
  makerPx: document.getElementById('maker-px'),
  makerQty: document.getElementById('maker-qty'),
  makerUntil: document.getElementById('maker-until'),
  makerTaker: document.getElementById('maker-taker'),
  btnSetRefPx: document.getElementById('btn-set-ref-px'),
  shareBox: document.getElementById('share-box'),
  shareJson: document.getElementById('share-json'),
  btnCopyJson: document.getElementById('btn-copy-json'),
  directJsonInput: document.getElementById('direct-json-input'),
  btnAcceptDirect: document.getElementById('btn-accept-direct'),
  streamContainer: document.getElementById('stream-container'),
  leaderboardTable: document.getElementById('leaderboard-table'),
  keyModal: document.getElementById('key-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnLoadWorkspaceKey: document.getElementById('btn-load-workspace-key'),
  btnConfirmImport: document.getElementById('btn-confirm-import'),
  modalKeyInput: document.getElementById('modal-key-input')
};

function logConsole(msg, isSuccess = false) {
  const ts = new Date().toLocaleTimeString();
  const line = `[${ts}] ${msg}`;
  el.terminalConsole.innerHTML = `<span style="${isSuccess ? 'color: var(--green);' : ''}">${line}</span><br>` + el.terminalConsole.innerHTML;
}

// Format numbers
function formatNum(num) {
  return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 1. Initialize Identity
async function initIdentity() {
  try {
    const res = await fetch('/api/identity');
    const data = await res.json();
    if (data.hasLocalKey && data.did) {
      STATE.did = data.did;
      STATE.hasLocalKey = true;
      el.activeDid.textContent = data.did;
      el.regStatusBadge.textContent = 'LOCAL NODE DETECTED';
      el.regStatusBadge.className = 'badge ready';
      logConsole(`Loaded local agent identity: ${data.did.slice(0, 16)}...`, true);
    } else {
      el.activeDid.textContent = 'No local key loaded. Click Import to add key.';
      el.regStatusBadge.textContent = 'KEY REQUIRED';
      el.regStatusBadge.className = 'badge warning';
    }
  } catch (err) {
    el.activeDid.textContent = 'Failed to connect to local server.';
  }
}

// 2. Fetch Market Data (with direct technocore.chat fallback for GitHub Pages)
async function fetchMarket() {
  try {
    let data = null;
    try {
      const res = await fetch('/api/market');
      if (res.ok) data = await res.json();
    } catch (e) {}

    // Fallback: direct browser fetch from technocore.chat (CORS enabled)
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
    }

    if (data.state && data.state.owners) {
      STATE.registeredAgents = data.state.owners;
      el.registeredAgents.textContent = data.state.owners.toLocaleString();
    }

    if (data.pos) {
      if (data.pos.open) el.openInterest.textContent = `${parseFloat(data.pos.open).toLocaleString()} POLF`;
    }

    if (data.pnl && data.pnl.top && data.pnl.top.length) {
      STATE.pnlList = data.pnl.top;
      const topAgent = data.pnl.top[0];
      el.topPnl.textContent = `+${topAgent[1]} POLF`;
      renderLeaderboard(data.pnl.top);
    }
  } catch (err) {
    console.error('Market fetch error:', err);
  }
}

// 3. Fetch Stream & Offers (with direct fallback)
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
  } catch (err) {
    console.error('Offers fetch error:', err);
  }
}

// Render Leaderboard
function renderLeaderboard(topList) {
  const tbody = el.leaderboardTable.querySelector('tbody');
  if (!topList || !topList.length) return;

  tbody.innerHTML = topList.slice(0, 20).map((item, idx) => {
    const did = item[0];
    const pnl = parseFloat(item[1]).toFixed(2);
    const isMe = STATE.did && did === STATE.did;
    return `
      <tr class="${isMe ? 'my-row' : ''}">
        <td><strong>#${idx + 1}</strong></td>
        <td><code>${did.slice(0, 16)}...${did.slice(-8)}</code> ${isMe ? '<span class="badge ready">YOU</span>' : ''}</td>
        <td class="text-green">+${pnl} POLF</td>
        <td><span class="stream-tag settled">In The Money</span></td>
      </tr>
    `;
  }).join('');
}

// Render Stream
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

// Update Quick Match Previews
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

// Sweep Timer
function updateSweepTimer() {
  const now = new Date();
  const secondsIntoFiveMin = (now.getMinutes() % 5) * 60 + now.getSeconds();
  const secondsRemaining = 300 - secondsIntoFiveMin;
  const m = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
  const s = (secondsRemaining % 60).toString().padStart(2, '0');
  el.sweepTimer.textContent = `${m}:${s}`;
}

// Take Specific Offer
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

// Event Listeners
function setupEvents() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
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

  // Filters
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      STATE.activeFilter = pill.dataset.filter;
      renderStream();
    });
  });

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
        logConsole(`Registration note: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      logConsole(`Registration error: ${err.message}`);
    }
  });

  // Set Reference Price in Maker Form
  el.btnSetRefPx.addEventListener('click', () => {
    if (STATE.refPrice) el.makerPx.value = STATE.refPrice.toFixed(2);
  });

  // Quick Long
  el.btnQuickLong.addEventListener('click', async () => {
    const qty = el.quickLongQty.value || '1.00';
    logConsole(`Executing Quick Long for ${qty} NVDA...`);

    // First try taking matching sell offer
    const bestSeller = STATE.offers.find(o => o.terms.side === 'sell' && Math.abs(parseFloat(o.terms.px) - STATE.refPrice) <= 0.05 * STATE.refPrice);
    if (bestSeller) {
      await window.takeSpecificOffer(encodeURIComponent(JSON.stringify(bestSeller)));
    } else {
      // Broadcast liquidity offer
      logConsole(`No instant match. Publishing maker BUY order at $${STATE.refPrice.toFixed(2)}...`);
      const res = await fetch('/api/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          side: 'buy',
          qty: qty,
          px: STATE.refPrice.toFixed(2),
          untilSweep: STATE.currentSweep + 10
        })
      });
      const data = await res.json();
      if (res.ok) {
        logConsole(`✅ Maker BUY order broadcast successfully! ID: ${data.terms.id}`, true);
        fetchOffers();
      }
    }
  });

  // Quick Short
  el.btnQuickShort.addEventListener('click', async () => {
    const qty = el.quickShortQty.value || '1.00';
    logConsole(`Executing Quick Short for ${qty} NVDA...`);

    const bestBuyer = STATE.offers.find(o => o.terms.side === 'buy' && Math.abs(parseFloat(o.terms.px) - STATE.refPrice) <= 0.05 * STATE.refPrice);
    if (bestBuyer) {
      await window.takeSpecificOffer(encodeURIComponent(JSON.stringify(bestBuyer)));
    } else {
      logConsole(`No instant match. Publishing maker SELL order at $${STATE.refPrice.toFixed(2)}...`);
      const res = await fetch('/api/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          side: 'sell',
          qty: qty,
          px: STATE.refPrice.toFixed(2),
          untilSweep: STATE.currentSweep + 10
        })
      });
      const data = await res.json();
      if (res.ok) {
        logConsole(`✅ Maker SELL order broadcast successfully! ID: ${data.terms.id}`, true);
        fetchOffers();
      }
    }
  });

  // Maker Form Submit
  el.makerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const side = document.querySelector('input[name="maker-side"]:checked').value;
    const px = el.makerPx.value;
    const qty = el.makerQty.value;
    const sweeps = parseInt(el.makerUntil.value, 10);
    const untilSweep = STATE.currentSweep + sweeps;

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

  // Modal
  el.btnImportKey.addEventListener('click', () => el.keyModal.style.display = 'flex');
  el.btnCloseModal.addEventListener('click', () => el.keyModal.style.display = 'none');
}

// Run loop
async function start() {
  await initIdentity();
  await fetchMarket();
  await fetchOffers();
  setupEvents();

  setInterval(fetchMarket, 4000);
  setInterval(fetchOffers, 4000);
  setInterval(updateSweepTimer, 1000);
}

document.addEventListener('DOMContentLoaded', start);
