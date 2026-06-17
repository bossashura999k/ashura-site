// ─── Supported EVM networks (Etherscan‑family) ────────────────────────────
const NETWORKS = {
  ethereum: { apiBase: 'https://api.etherscan.io/api' },
  celo:     { apiBase: 'https://api.celoscan.io/api' },
  polygon:  { apiBase: 'https://api.polygonscan.com/api' },
  bsc:      { apiBase: 'https://api.bscscan.com/api' },
  arbitrum: { apiBase: 'https://api.arbiscan.io/api' },
  base:     { apiBase: 'https://api.basescan.org/api' },
};

// ─── Cryptoapis (for Bitcoin) ──────────────────────────────────────────────
const CRYPTOAPIS_BASE = 'https://rest.cryptoapis.io/v2';
const CRYPTOAPIS_KEY  = process.env.CRYPTOAPIS_API_KEY;

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

  const isBitcoin = network === 'bitcoin';
  const evmNet = NETWORKS[network];

  if (!isBitcoin && !evmNet) {
    return res.status(400).json({ error: `Unknown network: "${network}".` });
  }

  // ─── Validate wallet ──────────────────────────────────────────────────
  if (isBitcoin) {
    if (!/^[13][a-km-zA-HJ-NP-Z0-9]{25,34}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid Bitcoin address.' });
    }
  } else {
    if (!walletAddress || !/^0x[0-9a-fA-F]{40}$/i.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid or missing EVM wallet address.' });
    }
  }

  // ─── Bitcoin branch ──────────────────────────────────────────────────
  if (isBitcoin) {
    if (!CRYPTOAPIS_KEY) {
      return res.status(500).json({ error: 'Cryptoapis API key missing.' });
    }

    try {
      const url = `${CRYPTOAPIS_BASE}/blockchain-data/bitcoin/mainnet/addresses/${walletAddress}/transactions?limit=1000`;
      const resp = await fetch(url, {
        headers: { 'X-API-Key': CRYPTOAPIS_KEY }
      });
      if (!resp.ok) throw new Error(`Cryptoapis HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.response && data.response.statusCode >= 400) {
        throw new Error(data.response.message || 'Cryptoapis error');
      }

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
      return res.json({ success: true, count: logs.length, logs });

    } catch (err) {
      console.error('[bitcoin]', err.message);
      return res.status(500).json({ error: err.message || 'Bitcoin fetch failed' });
    }
  }

  // ─── EVM branch (using a single Etherscan API key) ──────────────────
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ETHERSCAN_API_KEY is not set.' });
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
    return `${evmNet.apiBase}?${p.toString()}`;
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

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error('[eth-logs]', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});