const { initiateSTKPush } = require('./utils/mpesa');
const dotenv = require('dotenv');
dotenv.config();

const testPhone = '0716462683';
const testAmount = 1;
const testTitle = 'Test Book';

console.log(`🚀 INITIATING TEST STK PUSH...`);
console.log(`Phone: ${testPhone}`);
console.log(`Amount: ${testAmount}`);
console.log(`ENV: ${process.env.MPESA_ENV}`);

initiateSTKPush(testPhone, testAmount, testTitle)
    .then(res => {
        console.log("✅ STK PUSH SUCCESS!");
        console.log(JSON.stringify(res, null, 2));
    })
    .catch(err => {
        console.error("❌ STK PUSH FAILED:");
        if (err.response) {
            console.error(JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
    });
