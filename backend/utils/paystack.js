const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ override: true });

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const verifyTransaction = async (reference) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    try {
        const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
            headers: {
                Authorization: `Bearer ${secretKey}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Paystack Verify Error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = { verifyTransaction };
