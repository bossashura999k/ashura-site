// ── Change this to your Render backend URL ────────────────────────────────
const BACKEND_URL = 'https://ashura-site.onrender.com';   // empty = use same domain (works on Render)

// ── Network + token registry ──────────────────────────────────────────────
// Explorer base URLs are for the "view on chain" links only (frontend)
const NETWORKS = {
  ethereum: {
    label:    'Ethereum',
    symbol:   'ETH',
    color:    '#627EEA',
    explorer: 'https://etherscan.io',
    tokens: [
      { symbol: 'All tokens',  address: '' },
      { symbol: 'USDT',  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
      { symbol: 'USDC',  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
      { symbol: 'WBTC',  address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
      { symbol: 'WETH',  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
      { symbol: 'DAI',   address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
      { symbol: 'LINK',  address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
      { symbol: 'UNI',   address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
      { symbol: 'SHIB',  address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
      { symbol: 'PEPE',  address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933' },
      { symbol: 'Custom address…', address: '__custom__' },
    ],
  },
  celo: {
    label:    'Celo',
    symbol:   'CELO',
    color:    '#35D07F',
    explorer: 'https://celoscan.io',
    tokens: [
      { symbol: 'All tokens', address: '' },
      { symbol: 'CELO',  address: '0x471EcE3750Da237f93B8E339c536989b8978a438' },
      { symbol: 'cUSD',  address: '0x765DE816845861e75A25fCA122bb6898B8B1282a' },
      { symbol: 'USDT',  address: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e' },
      { symbol: 'USDC',  address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C' },
      { symbol: 'cEUR',  address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73' },
      { symbol: 'cREAL', address: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787' },
      { symbol: 'WETH',  address: '0x66803FB87aBd4aaC3cbB3fAd02C686d6CB0b5B54' },
      { symbol: 'Custom address…', address: '__custom__' },
    ],
  },
  polygon: {
    label:    'Polygon',
    symbol:   'POL',
    color:    '#8247E5',
    explorer: 'https://polygonscan.com',
    tokens: [
      { symbol: 'All tokens', address: '' },
      { symbol: 'USDT',   address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' },
      { symbol: 'USDC',   address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
      { symbol: 'WETH',   address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' },
      { symbol: 'WBTC',   address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6' },
      { symbol: 'WMATIC', address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' },
      { symbol: 'DAI',    address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' },
      { symbol: 'Custom address…', address: '__custom__' },
    ],
  },
  bsc: {
    label:    'BNB Chain',
    symbol:   'BNB',
    color:    '#F0B90B',
    explorer: 'https://bscscan.com',
    tokens: [
      { symbol: 'All tokens', address: '' },
      { symbol: 'USDT',  address: '0x55d398326f99059fF775485246999027B3197955' },
      { symbol: 'USDC',  address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' },
      { symbol: 'WBNB',  address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
      { symbol: 'BUSD',  address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
      { symbol: 'WBTC',  address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c' },
      { symbol: 'DAI',   address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3' },
      { symbol: 'Custom address…', address: '__custom__' },
    ],
  },
  arbitrum: {
    label:    'Arbitrum',
    symbol:   'ARB',
    color:    '#12AAFF',
    explorer: 'https://arbiscan.io',
    tokens: [
      { symbol: 'All tokens', address: '' },
      { symbol: 'USDT',  address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' },
      { symbol: 'USDC',  address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
      { symbol: 'WETH',  address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' },
      { symbol: 'WBTC',  address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f' },
      { symbol: 'DAI',   address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' },
      { symbol: 'Custom address…', address: '__custom__' },
    ],
  },
  base: {
    label:    'Base',
    symbol:   'BASE',
    color:    '#0052FF',
    explorer: 'https://basescan.org',
    tokens: [
      { symbol: 'All tokens', address: '' },
      { symbol: 'USDC',  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
      { symbol: 'WETH',  address: '0x4200000000000000000000000000000000000006' },
      { symbol: 'DAI',   address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' },
      { symbol: 'USDbC', address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA' },
      { symbol: 'Custom address…', address: '__custom__' },
    ],
  },
  bitcoin: {
    label:    'Bitcoin',
    symbol:   'BTC',
    color:    '#F7931A',
    explorer: 'https://blockchain.com/explorer',
    tokens: [
      { symbol: 'BTC', address: '' },
    ],
  },
};

// ── State ─────────────────────────────────────────────────────────────────
let currentNetwork = 'ethereum';

// ── DOM refs ──────────────────────────────────────────────────────────────
const walletInput   = document.getElementById('walletAddr');
const contractInput = document.getElementById('contractAddr');
const fromInput     = document.getElementById('fromBlock');
const toInput       = document.getElementById('toBlock');
const dirSelect     = document.getElementById('direction');
const fetchBtn      = document.getElementById('fetchBtn');
const btnInner      = document.getElementById('btnInner');
const logsBody      = document.getElementById('logsBody');
const errorBox      = document.getElementById('errorBox');
const statsBar      = document.getElementById('statsBar');
const netPillsEl    = document.getElementById('netPills');
const tokenSelect   = document.getElementById('tokenSelect');
const customField   = document.getElementById('customField');
const netPill       = document.getElementById('netPill');

// ── Build network pills ───────────────────────────────────────────────────
function buildNetPills() {
  netPillsEl.innerHTML = '';
  Object.entries(NETWORKS).forEach(([key, net]) => {
    const btn = document.createElement('button');
    btn.className = 'net-btn' + (key === currentNetwork ? ' active' : '');
    btn.dataset.net = key;
    btn.innerHTML = `<span class="net-dot" style="color:${net.color}"></span>${net.label}`;
    btn.addEventListener('click', () => switchNetwork(key));
    netPillsEl.appendChild(btn);
  });
}

// ── Build token dropdown for current network ──────────────────────────────
function buildTokenDropdown() {
  const net = NETWORKS[currentNetwork];
  tokenSelect.innerHTML = '';
  net.tokens.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.address;
    opt.textContent = t.address && t.address !== '__custom__'
      ? `${t.symbol} — ${t.address.slice(0, 6)}…${t.address.slice(-4)}`
      : t.symbol;
    tokenSelect.appendChild(opt);
  });
}

// ── Switch network ────────────────────────────────────────────────────────
function switchNetwork(key) {
  currentNetwork = key;
  const net = NETWORKS[key];

  document.documentElement.style.setProperty('--net-color', net.color);
  netPill.textContent = `⬡ ${net.label}`;

  buildNetPills();
  buildTokenDropdown();

  customField.classList.remove('visible');
}

// ── Token dropdown change ─────────────────────────────────────────────────
tokenSelect.addEventListener('change', () => {
  const val = tokenSelect.value;
  if (val === '__custom__') {
    customField.classList.add('visible');
    contractInput.value = '';
    contractInput.focus();
  } else {
    customField.classList.remove('visible');
    contractInput.value = val;
  }
});

// ── Resolve contract address ──────────────────────────────────────────────
function resolveContract() {
  const val = tokenSelect.value;
  if (val === '__custom__') return contractInput.value.trim();
  return val;
}

// ── Utilities ─────────────────────────────────────────────────────────────
const trunc = (str, h = 6, t = 4) =>
  str && str.length > h + t + 3 ? `${str.slice(0, h)}…${str.slice(-t)}` : str;

const fmtBig = str => str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const isValidAddr = addr => /^0x[0-9a-fA-F]{40}$/i.test(addr);

function explorerLinks() {
  const base = NETWORKS[currentNetwork].explorer;
  return {
    tx:   hash => `${base}/tx/${hash}`,
    addr: a    => `${base}/address/${a}`,
    blk:  n    => `${base}/block/${n}`,
  };
}

async function copyAddr(text, el) {
  try {
    await navigator.clipboard.writeText(text);
    const prev = el.textContent;
    el.classList.add('copied');
    el.textContent = '✓ copied';
    setTimeout(() => { el.classList.remove('copied'); el.textContent = prev; }, 1500);
  } catch { /* unavailable */ }
}

function setLoading(on) {
  fetchBtn.disabled = on;
  btnInner.innerHTML = on ? '<span class="spinner"></span>' : '⟳';
}
function showError(msg) { errorBox.textContent = `⚠ ${msg}`; errorBox.classList.remove('hidden'); }
function clearError()   { errorBox.textContent = ''; errorBox.classList.add('hidden'); }

// ── Render rows ───────────────────────────────────────────────────────────
function renderRows(logs) {
  if (!logs.length) {
    logsBody.innerHTML = `<tr><td colspan="7">
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
      <td><span class="amount">${fmtBig(log.rawAmount)}</span></td>
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

// ── Main fetch ────────────────────────────────────────────────────────────
async function fetchLogs() {
  clearError();

  const wallet   = walletInput.value.trim();
  const contract = resolveContract();
  const from     = fromInput.value.trim() || '0';
  const to       = toInput.value.trim()   || 'latest';
  const dir      = dirSelect.value;

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

    renderRows(data.logs);
  } catch (err) {
    showError(err.message || 'Fetch failed — check your backend URL.');
  } finally {
    setLoading(false);
  }
}

fetchBtn.addEventListener('click', fetchLogs);
walletInput.addEventListener('keydown', e => { if (e.key === 'Enter') fetchLogs(); });

// ── Init ──────────────────────────────────────────────────────────────────
buildNetPills();
buildTokenDropdown();
switchNetwork('ethereum');