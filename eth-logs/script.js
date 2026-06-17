// ─── Supported EVM networks (Etherscan‑family) ────────────────────────────
const NETWORKS = {
  ethereum: { apiBase: 'https://api.etherscan.io/api',    envKey: 'ETHERSCAN_API_KEY'   },
  celo:     { apiBase: 'https://api.celoscan.io/api',     envKey: 'CELOSCAN_API_KEY'    },
  polygon:  { apiBase: 'https://api.polygonscan.com/api', envKey: 'POLYGONSCAN_API_KEY' },
  bsc:      { apiBase: 'https://api.bscscan.com/api',     envKey: 'BSCSCAN_API_KEY'     },
  arbitrum: { apiBase: 'https://api.arbiscan.io/api',     envKey: 'ARBISCAN_API_KEY'    },
  base:     { apiBase: 'https://api.basescan.org/api',    envKey: 'BASESCAN_API_KEY'    },
  // Bitcoin is not in this object – handled separately via Cryptoapis
};

// ─── Cryptoapis (for Bitcoin) ──────────────────────────────────────────────
const CRYPTOAPIS_BASE = 'https://rest.cryptoapis.io/v2';
const CRYPTOAPIS_KEY  = process.env.CRYPTOAPIS_API_KEY;   // set this in your environment

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

// ─── Endpoint ──────────────────────────────────────────────────────────────
app.get('/api/eth-logs', async (req, res) => {
  const {
    walletAddress,
    contractAddress,
    fromBlock = '0',
    toBlock   = 'latest',
    direction = 'both',
    network   = 'ethereum',
  } = req.query;

  // ─── Validate network ──────────────────────────────────────────────────
  const isBitcoin = network === 'bitcoin';
  const evmNet = NETWORKS[network];

  if (!isBitcoin && !evmNet) {
    return res.status(400).json({ error: `Unknown network: "${network}".` });
  }

  // ─── Validate wallet address ──────────────────────────────────────────
  if (isBitcoin) {
    // Simple Bitcoin address validation (mainnet P2PKH/P2SH)
    if (!/^[13][a-km-zA-HJ-NP-Z0-9]{25,34}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Bitcoin address.' });
    }
  } else {
    // EVM address
    if (!walletAddress || !/^0x[0-9a-fA-F]{40}$/i.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid or missing EVM wallet address.' });
    }
  }

  // ─── Bitcoin branch ──────────────────────────────────────────────────────
  if (isBitcoin) {
    if (!CRYPTOAPIS_KEY) {
      return res.status(500).json({ error: 'Cryptoapis API key is not set on the server.' });
    }

    try {
      // Fetch transactions for the address (limit 1000, can be increased)
      const url = `${CRYPTOAPIS_BASE}/blockchain-data/bitcoin/mainnet/addresses/${walletAddress}/transactions?limit=1000`;
      const resp = await fetch(url, {
        headers: { 'X-API-Key': CRYPTOAPIS_KEY }
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Cryptoapis HTTP ${resp.status}: ${errText}`);
      }
      const data = await resp.json();
      if (data.response && data.response.statusCode >= 400) {
        throw new Error(data.response.message || 'Cryptoapis API error');
      }

      const txs = data.response?.data?.items || [];

      // Parse block range
      const from = parseInt(fromBlock, 10) || 0;
      const to   = toBlock === 'latest' ? Infinity : parseInt(toBlock, 10);

      const logs = [];

      txs.forEach(tx => {
        const blockHeight = tx.blockHeight;
        if (blockHeight < from || blockHeight > to) return;

        // Check if our address appears in inputs or outputs
        const isOut = tx.inputs?.some(inp => inp.address === walletAddress);
        const isIn  = tx.outputs?.some(out => out.address === walletAddress);

        // Direction filter
        if (direction === 'incoming' && !isIn) return;
        if (direction === 'outgoing' && !isOut) return;
        if (direction === 'both' && !isIn && !isOut) return;

        let fromAddr = null, toAddr = null, amount = '0';

        if (isOut) {
          fromAddr = walletAddress;
          // Pick the first output that is not our address (change address)
          const out = tx.outputs?.find(o => o.address !== walletAddress);
          if (out) {
            toAddr = out.address;
            amount = out.amount; // in satoshis
          }
        } else if (isIn) {
          toAddr = walletAddress;
          // Find the first input that is not our address (sender)
          const inp = tx.inputs?.find(i => i.address !== walletAddress);
          if (inp) fromAddr = inp.address;
          // Sum all outputs sent to our address
          const total = tx.outputs
            ?.filter(o => o.address === walletAddress)
            .reduce((sum, o) => sum + BigInt(o.amount), 0n) || 0n;
          amount = total.toString();
        }

        logs.push({
          direction: isOut ? 'out' : 'in',
          blockNumber: blockHeight,
          transactionHash: tx.transactionId,
          contractAddress: null,    // no contract for BTC
          from: fromAddr,
          to: toAddr,
          rawAmount: amount,
        });
      });

      // Sort descending by block number
      logs.sort((a, b) => b.blockNumber - a.blockNumber);

      return res.json({ success: true, count: logs.length, logs });

    } catch (err) {
      console.error('[bitcoin]', err.message);
      return res.status(500).json({ error: err.message || 'Bitcoin fetch failed' });
    }
  }

  // ─── EVM branch (unchanged from original) ──────────────────────────────
  // (Your existing code using Etherscan‑family APIs)

  const net = evmNet;
  const apiKey = process.env[net.envKey];
  if (!apiKey) {
    return res.status(500).json({
      error: `API key for ${network} (${net.envKey}) is not set on the server.`
    });
  }

  const buildUrl = (topic1, topic2) => {
    const p = new URLSearchParams({
      module:    'logs',
      action:    'getLogs',
      fromBlock,
      toBlock,
      topic0:    TRANSFER_TOPIC0,
      apikey:    apiKey,
    });
    if (contractAddress && /^0x[0-9a-fA-F]{40}$/i.test(contractAddress)) {
      p.set('address', contractAddress);
    }
    if (topic1) { p.set('topic1', topic1); p.set('topic0_1_opr', 'and'); }
    if (topic2) { p.set('topic2', topic2); p.set('topic0_2_opr', 'and'); }
    return `${net.apiBase}?${p.toString()}`;
  };

  const fetchLogs = async (url) => {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Scanner HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.status === '0' && data.message !== 'No records found') {
      throw new Error(data.result || data.message || 'Scanner API error');
    }
    return Array.isArray(data.result) ? data.result : [];
  };

  try {
    const paddedWallet = padAddress(walletAddress);
    let raw = [];

    if (direction === 'incoming' || direction === 'both') {
      const logs = await fetchLogs(buildUrl(null, paddedWallet));
      logs.forEach(l => (l._dir = 'in'));
      raw = raw.concat(logs);
    }
    if (direction === 'outgoing' || direction === 'both') {
      const logs = await fetchLogs(buildUrl(paddedWallet, null));
      logs.forEach(l => (l._dir = 'out'));
      raw = raw.concat(logs);
    }

    const seen = new Set();
    raw = raw.filter(l => {
      const key = l.transactionHash + l.logIndex;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const logs = raw
      .map(l => ({
        direction:       l._dir,
        blockNumber:     parseInt(l.blockNumber, 16),
        transactionHash: l.transactionHash,
        contractAddress: l.address,
        from:            l.topics[1] ? parseAddress(l.topics[1]) : null,
        to:              l.topics[2] ? parseAddress(l.topics[2]) : null,
        rawAmount:       hexToDecimal(l.data),
      }))
      .sort((a, b) => b.blockNumber - a.blockNumber);

    res.json({ success: true, count: logs.length, logs });

  } catch (err) {
    console.error('[eth-logs]', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});