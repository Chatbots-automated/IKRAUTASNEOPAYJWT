const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    amount,
    transactionId,
    clientRedirectUrl = 'https://google.com',
    paymentPurpose = 'Testinis avansas'
  } = req.body;

  if (!amount || !transactionId) {
    return res.status(400).json({ error: 'Missing required fields: amount or transactionId' });
  }

  // ✅ Payload with both transactionId and internalId
  const payload = {
    projectId: 16155,
    amount,
    currency: 'EUR',
    transactionId,
    internalId: transactionId, // ✅ This lets Make.com access the dynamic key
    paymentPurpose,
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
