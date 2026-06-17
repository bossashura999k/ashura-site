const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Import your route handler ──────────────────────────────────────────
const ethLogsRoute = require('./api/eth-logs');

// ─── Serve static files (HTML, CSS, JS) ────────────────────────────────
app.use(express.static(path.join(__dirname)));

// ─── Mount the API route ────────────────────────────────────────────────
app.use('/api', ethLogsRoute);   // This makes /api/eth-logs available

// ─── Start server ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});