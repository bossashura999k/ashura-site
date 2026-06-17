const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Import the API route
const ethLogsRoute = require('./api/eth-logs');

// ─── Health check endpoint ────────────────────────────────────────────────
app.get('/api/healthz', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'No worries Ashura, I\'m working 💪' 
  });
});

app.use(cors());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Mount the main API
app.use('/api', ethLogsRoute);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});