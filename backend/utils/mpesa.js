const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ override: true });

const getAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const url = process.env.MPESA_ENV === 'sandbox' 
        ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('M-Pesa Access Token Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to generate M-Pesa access token');
    }
};

const initiateSTKPush = async (phone, amount, bookTitle) => {
    const accessToken = await getAccessToken();
    const url = process.env.MPESA_ENV === 'sandbox'
        ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const shortCode = process.env.MPESA_STORE_NUMBER || process.env.MPESA_SHORTCODE; // BusinessShortCode (Store Number for Buy goods)
    const tillNumber = process.env.MPESA_TILL_NUMBER || shortCode; // PartyB
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // Normalize phone number to 254...
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.slice(1);
    }
    if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
    }

    const requestBody = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerBuyGoodsOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: tillNumber,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: bookTitle.substring(0, 12),
        TransactionDesc: `Payment for ${bookTitle}`
    };

    try {
        const response = await axios.post(url, requestBody, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('M-Pesa STK Push Error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = { initiateSTKPush };
