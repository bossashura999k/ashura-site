const router = require('express').Router();

// ─── Supported EVM networks (Etherscan API V2 — unified endpoint) ─────────
// As of 2025-08-15 Etherscan deprecated the per-chain V1 endpoints
// (api.etherscan.io/api, api.polygonscan.com/api, api.bscscan.com/api, ...).
// V2 uses ONE base URL + a `chainid` param, and a SINGLE Etherscan API key
// works across every supported chain — no more per-network keys needed.
const ETHERSCAN_V2_BASE = 'https://api.etherscan.io/v2/api';

const NETWORKS = {
  ethereum: { chainId: 1 },
  celo:     { chainId: 42220 },
  polygon:  { chainId: 137 },
  bsc:      { chainId: 56 },
  arbitrum: { chainId: 42161 },
  base:     { chainId: 8453 },
};

// ─── Cryptoapis (for Bitcoin) ──────────────────────────────────────────────
const CRYPTOAPIS_BASE = 'https://rest.cryptoapis.io/v2';
const CRYPTOAPIS_KEY  = process.env.CRYPTOAPIS_API_KEY;

// ─── Bitcoin address validator ─────────────────────────────────────────────
function isValidBitcoinAddress(address) {
  // Legacy (P2PKH) – starts with '1', length 25-34
  if (/^[1][a-km-zA-HJ-NP-Z0-9]{25,34}$/.test(address)) return true;
  // P2SH – starts with '3', length 25-34
  if (/^[3][a-km-zA-HJ-NP-Z0-9]{25,34}$/.test(address)) return true;
  // Bech32 (SegWit) – starts with 'bc1', length 42-62 (typical)
  if (/^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(address)) return true;
  return false;
}

// ─── Shared helpers ──────────────────────────────────────────────────────
const TRANSFER_TOPIC0 =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

function padAddress(addr) {
  return '0x' + addr.toLowerCase().replace('0x', '').padStart(64, '0');
}
function parseAddress(topic) {
  return '0x' + topic.slice(26);
}
function hexToDecimal(hex) {
  if (!hex || hex === '0x' || hex === '0x0') return '0';
  try { return BigInt(hex).toString(); } catch { return '0'; }
}

// ─── Tiny in-memory TTL cache ──────────────────────────────────────────────
// Avoids re-hitting the scanner/Cryptoapis APIs for identical, repeated
// queries (common when a user tweaks the UI and re-submits, or hits back).
const CACHE_TTL_MS = 30 * 1000; // 30s — logs are near-real-time data
const cache = new Map();

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.time > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}
function cacheSet(key, value) {
  cache.set(key, { value, time: Date.now() });
  // opportunistic cleanup so the Map doesn't grow unbounded
  if (cache.size > 500) {
    const cutoff = Date.now() - CACHE_TTL_MS;
    for (const [k, v] of cache) if (v.time < cutoff) cache.delete(k);
  }
}

// ─── Endpoint ──────────────────────────────────────────────────────────────
router.get('/eth-logs', async (req, res) => {
  const {
    walletAddress,
    contractAddress,
    fromBlock = '0',
    toBlock   = 'latest',
    direction = 'both',
    network   = 'ethereum',
    page      = '1',
    offset    = '1000', // Etherscan V2 getLogs max page size
  } = req.query;

  const isBitcoin = network === 'bitcoin';
  const evmNet = NETWORKS[network];

  if (!isBitcoin && !evmNet) {
    return res.status(400).json({ error: `Unknown network: "${network}".` });
  }

  // ─── Validate wallet ──────────────────────────────────────────────────
  if (isBitcoin) {
    if (!walletAddress || !isValidBitcoinAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Bitcoin address.' });
    }
  } else {
    if (!walletAddress || !/^0x[0-9a-fA-F]{40}$/i.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid or missing EVM wallet address.' });
    }
  }

  const cacheKey = JSON.stringify({
    walletAddress, contractAddress, fromBlock, toBlock, direction, network, page, offset,
  });
  const cached = cacheGet(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  // ─── Bitcoin branch ──────────────────────────────────────────────────
  if (isBitcoin) {
    if (!CRYPTOAPIS_KEY) {
      return res.status(500).json({ error: 'Cryptoapis API key missing.' });
    }

    try {
      // Build URL with limit
      const url = `${CRYPTOAPIS_BASE}/blockchain-data/bitcoin/mainnet/addresses/${encodeURIComponent(walletAddress)}/transactions?limit=1000`;

      const resp = await fetch(url, {
        headers: { 'X-API-Key': CRYPTOAPIS_KEY }
      });

      // Get response body as text (for error debugging)
      const responseText = await resp.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // If not JSON, treat as plain text
        data = { error: responseText };
      }

      if (!resp.ok) {
        // Log the full error for debugging (server logs)
        console.error('[Cryptoapis] Error response:', {
          status: resp.status,
          statusText: resp.statusText,
          body: responseText
        });
        // Return a user-friendly error
        // Return a user-friendly error
        const extractMsg = (val) => {
          if (!val) return null;
          if (typeof val === 'string') return val;
          if (typeof val === 'object') return val.message || val.error || JSON.stringify(val);
          return String(val);
        };
        const errorMsg =
          extractMsg(data.response?.message) ||
          extractMsg(data.error) ||
          responseText ||
          'Cryptoapis API error';
        return res.status(resp.status).json({ error: `Cryptoapis error: ${errorMsg}` });
      }

      // If we got here, it's a successful response
      const txs = data.response?.data?.items || [];
      const from = parseInt(fromBlock, 10) || 0;
      const to   = toBlock === 'latest' ? Infinity : parseInt(toBlock, 10);
      const logs = [];

      txs.forEach(tx => {
        const blockHeight = tx.blockHeight;
        if (blockHeight < from || blockHeight > to) return;

        const isOut = tx.inputs?.some(inp => inp.address === walletAddress);
        const isIn  = tx.outputs?.some(out => out.address === walletAddress);

        if (direction === 'incoming' && !isIn) return;
        if (direction === 'outgoing' && !isOut) return;
        if (direction === 'both' && !isIn && !isOut) return;

        let fromAddr = null, toAddr = null, amount = '0';

        if (isOut) {
          fromAddr = walletAddress;
          const out = tx.outputs?.find(o => o.address !== walletAddress);
          if (out) { toAddr = out.address; amount = out.amount; }
        } else if (isIn) {
          toAddr = walletAddress;
          const inp = tx.inputs?.find(i => i.address !== walletAddress);
          if (inp) fromAddr = inp.address;
          const total = tx.outputs
            ?.filter(o => o.address === walletAddress)
            .reduce((sum, o) => sum + BigInt(o.amount), 0n) || 0n;
          amount = total.toString();
        }

        logs.push({
          direction: isOut ? 'out' : 'in',
          blockNumber: blockHeight,
          transactionHash: tx.transactionId,
          contractAddress: null,
          from: fromAddr,
          to: toAddr,
          rawAmount: amount,
        });
      });

      logs.sort((a, b) => b.blockNumber - a.blockNumber);
      const payload = { success: true, count: logs.length, logs };
      cacheSet(cacheKey, payload);
      return res.json(payload);

    } catch (err) {
      console.error('[bitcoin]', err.message);
      return res.status(500).json({ error: err.message || 'Bitcoin fetch failed' });
    }
  }

  // ─── EVM branch (Etherscan API V2 — single key, all chains) ──────────
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ETHERSCAN_API_KEY is not set.' });
  }

  const buildUrl = (topic1, topic2) => {
    const p = new URLSearchParams({
      chainid:   String(evmNet.chainId),
      module:    'logs',
      action:    'getLogs',
      fromBlock,
      toBlock,
      page,
      offset,
      topic0:    TRANSFER_TOPIC0,
      apikey:    apiKey,
    });
    if (contractAddress && /^0x[0-9a-fA-F]{40}$/i.test(contractAddress)) {
      p.set('address', contractAddress);
    }
    if (topic1) { p.set('topic1', topic1); p.set('topic0_1_opr', 'and'); }
    if (topic2) { p.set('topic2', topic2); p.set('topic0_2_opr', 'and'); }
    return `${ETHERSCAN_V2_BASE}?${p.toString()}`;
  };

  const fetchLogs = async (url) => {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Scanner HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.message === 'NOTOK' && /deprecated V1/i.test(data.result || '')) {
      throw new Error('Scanner API rejected request: still pointed at deprecated V1 endpoint.');
    }
    if (data.status === '0' && data.message !== 'No records found') {
      throw new Error(data.result || data.message || 'Scanner API error');
    }
    return Array.isArray(data.result) ? data.result : [];
  };

  try {
    const paddedWallet = padAddress(walletAddress);

    // Fire incoming/outgoing requests concurrently instead of sequentially —
    // halves wall-clock latency when direction === 'both'.
    const requests = [];
    if (direction === 'incoming' || direction === 'both') {
      requests.push(
        fetchLogs(buildUrl(null, paddedWallet)).then(logs => {
          logs.forEach(l => (l._dir = 'in'));
          return logs;
        })
      );
    }
    if (direction === 'outgoing' || direction === 'both') {
      requests.push(
        fetchLogs(buildUrl(paddedWallet, null)).then(logs => {
          logs.forEach(l => (l._dir = 'out'));
          return logs;
        })
      );
    }

    const results = await Promise.all(requests);
    let raw = results.flat();

    const seen = new Set();
    raw = raw.filter(l => {
      const key = l.transactionHash + l.logIndex;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const logs = raw.map(l => ({
      direction:       l._dir,
      blockNumber:     parseInt(l.blockNumber, 16),
      transactionHash: l.transactionHash,
      contractAddress: l.address,
      from:            l.topics[1] ? parseAddress(l.topics[1]) : null,
      to:              l.topics[2] ? parseAddress(l.topics[2]) : null,
      rawAmount:       hexToDecimal(l.data),
    }));
    logs.sort((a, b) => b.blockNumber - a.blockNumber);

    // Signal to the client whether either leg returned a full page, meaning
    // there may be more results available on the next page.
    const pageSize = parseInt(offset, 10) || 1000;
    const hasMore = results.some(r => r.length >= pageSize);

    const payload = {
      success: true,
      count: logs.length,
      logs,
      page: parseInt(page, 10) || 1,
      hasMore,
    };
    cacheSet(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error('[eth-logs]', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;