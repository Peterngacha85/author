const axios = require('axios');

// Determine visitor's country from IP (used to default the currency selector)
exports.getCountry = async (req, res) => {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (forwarded ? forwarded.split(',')[0].trim() : null) || req.socket.remoteAddress;

    // Private/local IPs can't be geolocated — default to Kenya
    if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return res.json({ countryCode: 'KE' });
    }

    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      params: { fields: 'status,countryCode' },
      timeout: 3000
    });

    if (response.data.status === 'success' && response.data.countryCode) {
      return res.json({ countryCode: response.data.countryCode });
    }

    res.json({ countryCode: 'KE' });
  } catch (err) {
    console.error('Geo lookup error:', err.message);
    res.json({ countryCode: 'KE' });
  }
};
