const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const url = process.env.MPESA_ENV === 'sandbox' 
    ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

console.log(`TESTING TOKEN GENERATION...`);
console.log(`URL: ${url}`);
console.log(`Key prefix: ${consumerKey ? consumerKey.substring(0, 5) : 'NULL'}...`);

axios.get(url, {
    headers: { Authorization: `Basic ${auth}` }
}).then(res => {
    console.log("✅ SUCCESS! Access Token obtained.");
    console.log("Token:", res.data.access_token.substring(0, 10) + "...");
}).catch(err => {
    console.error("❌ ERROR fetching token:");
    console.error(err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
});
