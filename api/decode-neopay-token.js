const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) return res.status(400).json({ error: 'Unable to decode token' });

    const transactions = decoded.payload?.transactions;

    // ✅ Grab the first transactionId (key) and flatten
    if (transactions && typeof transactions === 'object') {
      const txIds = Object.keys(transactions);
      if (txIds.length > 0) {
        const txId = txIds[0];
        const txData = transactions[txId];

        // Inject leadId and amount as top-level fields
        decoded.payload.leadId = txId;
        decoded.payload.amount = txData?.amount;
        decoded.payload.transactionData = txData; // optional full object
      }
    }

    return res.status(200).json({ decoded });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to decode token', details: error.message });
  }
};
