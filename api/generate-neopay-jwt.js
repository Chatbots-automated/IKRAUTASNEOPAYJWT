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
    singleProjectItemId, // ✅ Added
    clientRedirectUrl = 'https://google.com'
  } = req.body;

  if (!amount || !transactionId || !singleProjectItemId) {
    return res.status(400).json({ error: 'Missing required fields: amount, transactionId or singleProjectItemId' });
  }

  const payload = {
    projectId: 16155,
    amount,
    currency: 'EUR',
    transactionId,
    internalId: transactionId,
    singleProjectItemId, // ✅ Injected
    type: 'advance',
    paymentPurpose: `Avansinis mokėjimas ${transactionId}`,
    serviceType: 'pisp',
    clientRedirectUrl,
    defaultLocale: 'LT'
  };

  const secret = 'edEIbadNdqu5UumPqd7Ni9DvBRd8HEMX';

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
