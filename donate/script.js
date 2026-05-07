// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────
const RECIPIENT = "0x3901CA874aECa291ea6B16e52B493ca18898C1A4";

const CELO_CHAIN_ID     = 42220;
const CELO_CHAIN_ID_HEX = "0xa4ec";

// USDT on Celo Mainnet
const TOKEN_ADDRESS  = "0x617f3112bf5397D0467D315cC709EF968D9ba546";
const TOKEN_SYMBOL   = "USDT";
const TOKEN_DECIMALS = 6; // USDT uses 6 decimals — hardcoded to avoid RPC failures
const TOKEN_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)"
];

// Donation contract on Celo Mainnet
const DONATION_CONTRACT_ADDRESS = "0xa88190691AfFc083C59bBdC73690308eF8b065d0";
const DONATION_ABI = [
  "function logDonation(uint256 amount, string calldata message) external"
];

// ─────────────────────────────────────────────
let provider, signer, token, donationContract, userAddress;

const isMiniPay = () => window.ethereum && window.ethereum.isMiniPay;

// ─────────────────────────────────────────────
//  DOM refs
// ─────────────────────────────────────────────
const connectSection   = document.getElementById("connectSection");
const connectBtn       = document.getElementById("connectBtn");
const walletInfo       = document.getElementById("walletInfo");
const walletAddress    = document.getElementById("walletAddress");
const balancePill      = document.getElementById("balancePill");
const donateSection    = document.getElementById("donateSection");
const donateBtn        = document.getElementById("donateBtn");
const donateBtnText    = document.getElementById("donateBtnText");
const donateBtnSpinner = document.getElementById("donateBtnSpinner");
const customAmount     = document.getElementById("customAmount");
const statusBox        = document.getElementById("statusBox");
const minipayNote      = document.getElementById("minipayNote");
const browserWarning   = document.getElementById("browserWarning");
const presetBtns       = document.querySelectorAll(".preset-btn");

// ─────────────────────────────────────────────
//  Init
// ─────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
  if (isMiniPay()) {
    minipayNote.classList.remove("hidden");
    await connectWallet();
  } else if (window.ethereum) {
    browserWarning.style.display = "block";
  } else {
    connectBtn.textContent = "No wallet detected";
    connectBtn.disabled = true;
  }
});

// ─────────────────────────────────────────────
//  Connect wallet
// ─────────────────────────────────────────────
connectBtn.addEventListener("click", connectWallet);

async function connectWallet() {
  try {
    connectBtn.disabled = true;
    connectBtn.textContent = "Connecting…";

    if (!window.ethereum) throw new Error("No wallet found");

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const chainId = parseInt(await window.ethereum.request({ method: "eth_chainId" }), 16);
    if (chainId !== CELO_CHAIN_ID) await switchToCelo();

    provider    = new ethers.BrowserProvider(window.ethereum);
    signer      = await provider.getSigner();
    token            = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
    donationContract = new ethers.Contract(DONATION_CONTRACT_ADDRESS, DONATION_ABI, signer);
    userAddress = await signer.getAddress();

    connectSection.classList.add("hidden");
    walletInfo.classList.remove("hidden");
    donateSection.classList.remove("hidden");

    walletAddress.textContent = shortAddr(userAddress);
    await refreshBalance();

  } catch (err) {
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect Wallet";
    showStatus("error", err.message || "Connection failed");
  }
}

async function switchToCelo() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CELO_CHAIN_ID_HEX }]
    });
  } catch (switchErr) {
    if (switchErr.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: CELO_CHAIN_ID_HEX,
          chainName: "Celo Mainnet",
          nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
          rpcUrls: ["https://1rpc.io/celo"],
          blockExplorerUrls: ["https://celoscan.io"]
        }]
      });
    } else throw switchErr;
  }
}

async function refreshBalance() {
  try {
    const raw = await token.balanceOf(userAddress);
    const bal = ethers.formatUnits(raw, TOKEN_DECIMALS);
    balancePill.textContent = `${parseFloat(bal).toFixed(2)} ${TOKEN_SYMBOL}`;
  } catch {
    balancePill.textContent = `— ${TOKEN_SYMBOL}`;
  }
}

// ─────────────────────────────────────────────
//  Preset buttons
// ─────────────────────────────────────────────
presetBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    presetBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    customAmount.value = btn.dataset.amount;
  });
});

customAmount.addEventListener("input", () => {
  presetBtns.forEach(b => b.classList.remove("active"));
});

// ─────────────────────────────────────────────
//  Send donation
// ─────────────────────────────────────────────
donateBtn.addEventListener("click", async () => {
  if (!signer) return;

  const amount = parseFloat(customAmount.value);
  if (!amount || amount <= 0) {
    showStatus("error", "Enter a valid donation amount.");
    return;
  }

  setLoading(true);
  showStatus("pending", "Waiting for confirmation in your wallet…");

  try {
    const amountWei = ethers.parseUnits(amount.toString(), TOKEN_DECIMALS);
    const tx        = await token.transfer(RECIPIENT, amountWei);

    showStatus("pending", "Transaction submitted. Waiting for block…");

    const receipt = await tx.wait();
    const hash    = receipt.hash || tx.hash;

    // Log donation onchain via our contract
    const message = document.getElementById("donateMessage").value.trim();
    try {
      const logTx = await donationContract.logDonation(amountWei, message);
      await logTx.wait();
    } catch {
      // Non-critical — donation still went through even if logging fails
    }

    showStatus("success", `✓ Donation of $${amount} ${TOKEN_SYMBOL} sent! Thank you 🙏
      <br/><a class="tx-link" href="https://celoscan.io/tx/${hash}" target="_blank" rel="noopener">View on Celoscan ↗</a>`);

    await refreshBalance();

  } catch (err) {
    const msg = err?.info?.error?.message || err?.message || "Transaction failed";
    showStatus("error", msg.length > 120 ? msg.slice(0, 120) + "…" : msg);
  } finally {
    setLoading(false);
  }
});

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function setLoading(on) {
  donateBtn.disabled = on;
  donateBtnText.textContent = on ? "Processing…" : "Send Donation";
  donateBtnSpinner.classList.toggle("hidden", !on);
}

function showStatus(type, msg) {
  statusBox.className = `status-box ${type}`;
  statusBox.innerHTML = msg;
}

function shortAddr(addr) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

// Handle account/chain changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => location.reload());
  window.ethereum.on("chainChanged",    () => location.reload());
}