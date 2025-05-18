const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    amount,
    transactionId,
    singleProjectItemId,
    clientRedirectUrl = 'https://google.com'
  } = req.body;

  if (!amount || !transactionId || !singleProjectItemId) {
    return res.status(400).json({ error: 'Missing required fields: amount, transactionId, or singleProjectItemId' });
  }

  const payload = {
    projectId: 99999, // ⛳️ Replace with your FINAL payment project ID
    amount,
    currency: 'EUR',
    transactionId,
    internalId: transactionId,
    singleProjectItemId, // ✅ custom field to identify row directly
    paymentPurpose: `Galutinis mokėjimas ${transactionId}`,
    serviceType: 'pisp',
    clientRedirectUrl,
    defaultLocale: 'LT'
  };

  const secret = 'your-final-payment-secret-key'; // 🛡️ Replace with real one

  try {
    const token = jwt.sign(payload, secret, {
      algorithm: 'HS256',
      noTimestamp: true
    });

    const url = `https://psd2.neopay.lt/widget.html?${token}`;
    return res.status(200).json({ token, url });
  } catch (err) {
    return res.status(500).json({ error: 'JWT signing failed', details: err.message });
  }
};
