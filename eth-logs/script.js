// ── Change this to your Render backend URL ────────────────────────────────
const BACKEND_URL = 'https://ashura-site.onrender.com';   // use relative URL (empty) – works on Render

// ── Network + token registry ──────────────────────────────────────────────
const NETWORKS = {
  ethereum: {
    label:    'Ethereum',
    symbol:   'ETH',
    color:    '#627EEA',
    explorer: 'https://etherscan.io',
    tokens: [
      { symbol: 'All tokens',  address: '' },
      { symbol: 'USDT',  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
      // ... (all your tokens)
    ],
  },
  // ... (celo, polygon, bsc, arbitrum, base, bitcoin)
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
// ... (all the UI code you had before)

// ── Build network pills, token dropdown, switchNetwork, etc. ────────────
// ... (the original frontend functions)

// ── Main fetch ────────────────────────────────────────────────────────────
async function fetchLogs() {
  // ... (your existing fetch logic, uses BACKEND_URL)
}

// ── Init ──────────────────────────────────────────────────────────────────
buildNetPills();
buildTokenDropdown();
switchNetwork('ethereum');