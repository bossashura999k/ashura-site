// ── Change this to your Render backend URL ────────────────────────────────
const BACKEND_URL = 'https://ashura-site.onrender.com';
// ── Token decimals (hardcoded for known tokens) ──────────────────────────
const TOKEN_DECIMALS = {
  // Ethereum
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': 6,  // USDT
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 6,  // USDC
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 8,  // WBTC
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 18, // WETH
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': 18, // DAI
  '0x514910771AF9Ca656af840dff83E8264EcF986CA': 18, // LINK
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': 18, // UNI
  '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE': 18, // SHIB
  '0x6982508145454Ce325dDbE47a25d4ec3d2311933': 18, // PEPE
  // Celo
  '0x471EcE3750Da237f93B8E339c536989b8978a438': 18, // CELO
  '0x765DE816845861e75A25fCA122bb6898B8B1282a': 18, // cUSD
  '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e': 6,  // USDT (Celo)
  '0xcebA9300f2b948710d2653dD7B07f33A8B32118C': 6,  // USDC (Celo)
  '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73': 18, // cEUR
  '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787': 18, // cREAL
  '0x66803FB87aBd4aaC3cbB3fAd02C686d6CB0b5B54': 18, // WETH (Celo)
  // Polygon
  '0xc2132D05D31c914a87C6611C10748AEb04B58e8F': 6,  // USDT
  '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': 6,  // USDC
  '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619': 18, // WETH
  '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6': 8,  // WBTC
  '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270': 18, // WMATIC
  '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063': 18, // DAI
  // BSC
  '0x55d398326f99059fF775485246999027B3197955': 18, // USDT (BSC)
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': 18, // USDC (BSC)
  '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': 18, // WBNB
  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56': 18, // BUSD
  '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c': 8,  // WBTC (BSC)
  '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3': 18, // DAI (BSC)
  // Arbitrum
  '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': 6,  // USDT
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 6,  // USDC
  '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': 18, // WETH
  '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f': 8,  // WBTC
  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': 18, // DAI
  // Base
  '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 6,  // USDC
  '0x4200000000000000000000000000000000000006': 18, // WETH
  '0x50c5725949A6F0c72E6C4a641F24049A917DB0cB': 18, // DAI
  '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA': 6,  // USDbC
};

// ── Network + token registry ──────────────────────────────────────────────
// (keep your existing NETWORKS object – unchanged)
const NETWORKS = { /* ... your full NETWORKS from earlier ... */ };

// ── State ─────────────────────────────────────────────────────────────────
let currentNetwork = 'ethereum';
let priceCache = {}; // cache prices per token address

// ── DOM refs ──────────────────────────────────────────────────────────────
// (keep all your existing DOM refs – unchanged)

// ── Build network pills, token dropdown, etc. ────────────────────────────
// (keep all your existing functions: buildNetPills, buildTokenDropdown,
//  switchNetwork, resolveContract, trunc, fmtBig, isValidAddr, explorerLinks,
//  copyAddr, setLoading, showError, clearError – unchanged)

// ─── New: fetch token prices from CoinGecko ──────────────────────────────
async function fetchPrices(tokens, network) {
  if (!tokens.length) return {};
  // CoinGecko platform mapping (network → platform id)
  const platformMap = {
    ethereum: 'ethereum',
    celo: 'celo',
    polygon: 'polygon-pos',
    bsc: 'binance-smart-chain',
    arbitrum: 'arbitrum-one',
    base: 'base',
    bitcoin: 'bitcoin', // not used for prices
  };
  const platform = platformMap[network];
  if (!platform) return {};

  // Build a map of contract addresses to decimals
  const tokenMap = {};
  tokens.forEach(addr => {
    const lower = addr.toLowerCase();
    tokenMap[lower] = { address: lower, decimals: TOKEN_DECIMALS[lower] || 18 };
  });

  // CoinGecko API: /simple/token_price/{platform}?contract_addresses=...
  const addresses = Object.keys(tokenMap).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${addresses}&vs_currencies=usd`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Price fetch failed');
    const data = await resp.json();
    // data is { '0x...': { usd: 123.45 } }
    return data;
  } catch (err) {
    console.warn('Could not fetch prices:', err);
    return {};
  }
}

// ── Render rows (updated with Amount and USD columns) ────────────────────
function renderRows(logs, prices = {}) {
  if (!logs.length) {
    logsBody.innerHTML = `<tr><td colspan="9">
      <div class="msg">
        <span class="icon">🔍</span>
        No Transfer events found for this address in the selected range.
      </div>
    </td></tr>`;
    return;
  }

  const ex = explorerLinks();
  logsBody.innerHTML = '';

  logs.forEach((log, i) => {
    const tr = document.createElement('tr');
    tr.style.animationDelay = `${i * 25}ms`;

    // Determine decimals and format amount
    const contractLower = log.contractAddress ? log.contractAddress.toLowerCase() : '';
    const decimals = TOKEN_DECIMALS[contractLower] || 18;
    const raw = BigInt(log.rawAmount);
    // Format with decimals (avoid floating point issues)
    const divisor = 10 ** decimals;
    const integer = raw / BigInt(divisor);
    const fractional = raw % BigInt(divisor);
    const formattedAmount = `${integer}.${fractional.toString().padStart(decimals, '0')}`;

    // Get price from cache
    let usdPrice = 0;
    if (log.contractAddress) {
      const addr = log.contractAddress.toLowerCase();
      if (prices[addr] && prices[addr].usd) {
        usdPrice = prices[addr].usd;
      }
    }
    // Calculate USD value
    const numericAmount = parseFloat(formattedAmount);
    const usdValue = numericAmount * usdPrice;

    const badge = log.direction === 'in'
      ? '<span class="badge badge-in">IN</span>'
      : '<span class="badge badge-out">OUT</span>';

    tr.innerHTML = `
      <td>${badge}</td>
      <td><a class="mlink" href="${ex.blk(log.blockNumber)}" target="_blank" rel="noopener">
        ${log.blockNumber.toLocaleString()}
      </a></td>
      <td><a class="mlink" href="${ex.tx(log.transactionHash)}" target="_blank" rel="noopener">
        ${trunc(log.transactionHash, 8, 6)}
      </a></td>
      <td><span class="addr" data-full="${log.from}" title="${log.from} — click to copy">
        ${trunc(log.from)}
      </span></td>
      <td><span class="addr" data-full="${log.to}" title="${log.to} — click to copy">
        ${trunc(log.to)}
      </span></td>
      <td><span class="amount">${formattedAmount}</span></td>
      <td><span class="amount">${usdPrice ? '$' + usdValue.toFixed(2) : '—'}</span></td>
      <td><a class="mlink" href="${ex.addr(log.contractAddress)}" target="_blank" rel="noopener">
        ${trunc(log.contractAddress)}
      </a></td>
    `;
    logsBody.appendChild(tr);
  });

  logsBody.querySelectorAll('.addr').forEach(el => {
    el.addEventListener('click', () => copyAddr(el.dataset.full, el));
  });
}

// ── Main fetch (updated to fetch prices) ────────────────────────────────
async function fetchLogs() {
  clearError();

  const wallet   = walletInput.value.trim();
  const contract = resolveContract();
  const from     = fromInput.value.trim() || '0';
  const to       = toInput.value.trim()   || 'latest';
  const dir      = dirSelect.value;

  // (validation unchanged)
  if (!wallet) { showError('Wallet address is required.'); return; }
  if (!isValidAddr(wallet) && currentNetwork !== 'bitcoin') {
    showError('Invalid wallet address — must be a 42-character 0x address.');
    return;
  }
  if (contract && !isValidAddr(contract)) {
    showError('Invalid contract address. Check the custom address field.');
    return;
  }

  setLoading(true);
  statsBar.classList.add('hidden');

  try {
    const params = new URLSearchParams({
      walletAddress: wallet,
      fromBlock:     from,
      toBlock:       to,
      direction:     dir,
      network:       currentNetwork,
    });
    if (contract) params.set('contractAddress', contract);

    const resp = await fetch(`${BACKEND_URL}/api/eth-logs?${params}`);
    const data = await resp.json();

    if (!resp.ok || !data.success) throw new Error(data.error || 'Server error.');

    const inCount  = data.logs.filter(l => l.direction === 'in').length;
    const outCount = data.logs.filter(l => l.direction === 'out').length;
    document.getElementById('statTotal').textContent = data.count;
    document.getElementById('statIn').textContent    = inCount;
    document.getElementById('statOut').textContent   = outCount;
    statsBar.classList.remove('hidden');

    // ── Fetch prices for unique contracts ──────────────────────────────
    const uniqueContracts = [...new Set(data.logs.map(l => l.contractAddress).filter(Boolean))];
    let prices = {};
    if (uniqueContracts.length && currentNetwork !== 'bitcoin') {
      prices = await fetchPrices(uniqueContracts, currentNetwork);
    }

    renderRows(data.logs, prices);
  } catch (err) {
    showError(err.message || 'Fetch failed — check your backend URL.');
  } finally {
    setLoading(false);
  }
}

// ── Event listeners and init ──────────────────────────────────────────────
fetchBtn.addEventListener('click', fetchLogs);
walletInput.addEventListener('keydown', e => { if (e.key === 'Enter') fetchLogs(); });

buildNetPills();
buildTokenDropdown();
switchNetwork('ethereum');