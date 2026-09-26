/**
 * Technocore Close Call Terminal — Server
 * Zero-dependency local server providing static assets and proxy/signing APIs
 * for the FLOP Technocore Close Call Challenge ($FLOP).
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let PORT = 5192;
const MAX_PORT = 5210;
const TECHNOCORE_HOST = 'technocore.chat';
const ROOM = 'close1';
const SEASON = 'close-1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Helper: Resolve local identity files if available
function getLocalIdentity() {
  const searchDirs = [
    path.join(__dirname, '..'),
    __dirname,
    process.cwd()
  ];

  for (const dir of searchDirs) {
    const pemPath = path.join(dir, 'flop-identity.pem');
    const rtfPath = path.join(dir, 'pass.rtf');
    if (fs.existsSync(pemPath) && fs.existsSync(rtfPath)) {
      try {
        const pem = fs.readFileSync(pemPath, 'utf8');
        const rtf = fs.readFileSync(rtfPath, 'utf8');
        const match = rtf.match(/(?:Flop passphrase:\s*|passphrase:\s*)([^\s\\}]+)/i);
        if (!match) continue;
        const passphrase = match[1].trim();

        const privateKey = crypto.createPrivateKey({ key: pem, format: 'pem', passphrase });
        const publicKey = crypto.createPublicKey(privateKey);
        const jwk = publicKey.export({ format: 'jwk' });
        const rawPub = Buffer.from(jwk.x, 'base64url');

        const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let n = 0n;
        for (const byte of rawPub) n = (n << 8n) | BigInt(byte);
        let res = '';
        while (n > 0n) {
          const rem = Number(n % 58n);
          n = n / 58n;
          res = ALPHABET[rem] + res;
        }
        let pad = 0;
        for (const byte of rawPub) {
          if (byte === 0) pad++; else break;
        }
        const b58 = '1'.repeat(pad) + res;

        // ed25519 multicodec 0xed01
        const codecBuf = Buffer.concat([Buffer.from([0xed, 0x01]), rawPub]);
        let nC = 0n;
        for (const b of codecBuf) nC = (nC << 8n) | BigInt(b);
        let resC = '';
        while (nC > 0n) {
          const rem = Number(nC % 58n);
          nC = nC / 58n;
          resC = ALPHABET[rem] + resC;
        }
        let padC = 0;
        for (const b of codecBuf) { if (b === 0) padC++; else break; }
        const did = 'did:key:z' + ('1'.repeat(padC) + resC);

        return { privateKey, publicKey, did, available: true };
      } catch (e) {}
    }
  }
  return { available: false };
}

function fetchTechnocore(urlPath) {
  return new Promise((resolve) => {
    https.get(`https://${TECHNOCORE_HOST}${urlPath}`, {
      headers: { 'User-Agent': 'TechnocoreCloseCallTerminal/1.0' },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: data });
        }
      });
    }).on('error', (err) => resolve({ statusCode: 0, error: err.message }));
  });
}

function postTechnocore(room, text, identity) {
  const nonce = Date.now().toString();
  const payload = `${room}|${nonce}|${text}`;
  const sig = crypto.sign(null, Buffer.from(payload, 'utf8'), identity.privateKey).toString('base64url');

  const postData = JSON.stringify({
    did: identity.did,
    sig: sig,
    nonce: nonce,
    text: text
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: TECHNOCORE_HOST,
      port: 443,
      path: `/r/${room}?format=json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'TechnocoreCloseCallTerminal/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (err) => resolve({ statusCode: 0, error: err.message }));
    req.write(postData);
    req.end();
  });
}

function serializeSorted(obj) {
  const keys = Object.keys(obj).sort();
  const sortedObj = {};
  keys.forEach(k => sortedObj[k] = obj[k]);
  return JSON.stringify(sortedObj);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (pathname === '/api/identity' && req.method === 'GET') {
    const ident = getLocalIdentity();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      hasLocalKey: ident.available,
      did: ident.available ? ident.did : null
    }));
    return;
  }

  if (pathname === '/api/market' && req.method === 'GET') {
    try {
      const [priceRes, stateRes, pnlRes, posRes] = await Promise.all([
        fetchTechnocore('/r/d-close1-price?limit=1&format=json'),
        fetchTechnocore('/r/d-close1-state?limit=1&format=json'),
        fetchTechnocore('/r/d-close1-pnl?limit=1&format=json'),
        fetchTechnocore('/r/d-close1-positions?limit=1&format=json')
      ]);

      let price = null, state = null, pnl = null, pos = null;
      if (priceRes.data && priceRes.data.messages && priceRes.data.messages.length) {
        try { price = JSON.parse(priceRes.data.messages[0].text); } catch (e) {}
      }
      if (stateRes.data && stateRes.data.messages && stateRes.data.messages.length) {
        try { state = JSON.parse(stateRes.data.messages[0].text); } catch (e) {}
      }
      if (pnlRes.data && pnlRes.data.messages && pnlRes.data.messages.length) {
        try { pnl = JSON.parse(pnlRes.data.messages[0].text); } catch (e) {}
      }
      if (posRes.data && posRes.data.messages && posRes.data.messages.length) {
        try { pos = JSON.parse(posRes.data.messages[0].text); } catch (e) {}
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ price, state, pnl, pos, timestamp: new Date().toISOString() }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/offers' && req.method === 'GET') {
    try {
      const roomRes = await fetchTechnocore(`/r/${ROOM}?limit=50&format=json`);
      const offers = [];
      const trades = [];

      if (roomRes.data && roomRes.data.messages) {
        for (const msg of roomRes.data.messages) {
          try {
            const parsed = JSON.parse(msg.text);
            if (parsed.t === 'offer' && parsed.terms && parsed.terms.taker === 'any') {
              offers.push({
                seq: msg.seq,
                ts: msg.ts,
                from: msg.from,
                terms: parsed.terms,
                maker_sig: parsed.maker_sig
              });
            } else if (parsed.t === 'trade' && parsed.terms) {
              trades.push({
                seq: msg.seq,
                ts: msg.ts,
                from: msg.from,
                terms: parsed.terms,
                taker: parsed.taker
              });
            }
          } catch (e) {}
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ offers, trades: trades.slice(-15) }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/register' && req.method === 'POST') {
    const ident = getLocalIdentity();
    if (!ident.available) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No local identity found. Please import key.' }));
      return;
    }

    const regObj = { t: "owner", season: SEASON, key: ident.did };
    const text = JSON.stringify(regObj);
    const postRes = await postTechnocore(ROOM, text, ident);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(postRes));
    return;
  }

  if (pathname === '/api/offer' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const ident = getLocalIdentity();
        if (!ident.available) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Local identity not available' }));
          return;
        }

        const tradeId = 'ilm-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');
        const terms = {
          id: tradeId,
          maker: ident.did,
          px: parseFloat(payload.px).toFixed(2),
          qty: parseFloat(payload.qty).toFixed(2),
          side: payload.side,
          taker: "any",
          until: parseInt(payload.untilSweep, 10)
        };

        const termsString = serializeSorted(terms);
        const termsPayload = `${SEASON}|terms|${termsString}`;
        const makerSig = crypto.sign(null, Buffer.from(termsPayload, 'utf8'), ident.privateKey).toString('base64url');

        const offerObj = {
          t: "offer",
          season: SEASON,
          terms: terms,
          maker_sig: makerSig,
          how: `countersign close-1|accept|<terms>|<your did:key> and post t=trade`
        };

        const text = JSON.stringify(offerObj);
        const postRes = await postTechnocore(ROOM, text, ident);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ postRes, terms, makerSig, offerObj }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/take' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const ident = getLocalIdentity();
        if (!ident.available) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Local identity not available' }));
          return;
        }

        const terms = payload.terms;
        const termsString = serializeSorted(terms);
        const acceptPayload = `${SEASON}|accept|${termsString}|${ident.did}`;
        const takerSig = crypto.sign(null, Buffer.from(acceptPayload, 'utf8'), ident.privateKey).toString('base64url');

        const tradeObj = {
          t: "trade",
          season: SEASON,
          terms: terms,
          taker: ident.did,
          maker_sig: payload.maker_sig,
          taker_sig: takerSig
        };

        const text = JSON.stringify(tradeObj);
        const postRes = await postTechnocore(ROOM, text, ident);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ postRes, tradeObj }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Serve Static Files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

function startServer(port) {
  server.listen(port, () => {
    PORT = port;
    console.log(`\n========================================================`);
    console.log(`⚡ Technocore Close Call Terminal ($FLOP Challenge)`);
    console.log(`   Running at: http://localhost:${port}`);
    console.log(`========================================================\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < MAX_PORT) {
      startServer(port + 1);
    } else {
      console.error('Server error:', err.message);
    }
  });
}

startServer(PORT);
