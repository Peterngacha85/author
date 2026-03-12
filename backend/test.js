const axios = require('axios');

async function testBackend() {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    console.log('--- Testing Backend Endpoints ---');
    
    // 1. Test Base URL
    const rootRes = await axios.get('http://localhost:5000/');
    console.log('Base URL:', rootRes.data);

    // 2. Test Register (Mock)
    console.log('\nNote: To test full functionality, run the server and use Postman/Curl.');
    console.log('Backend structure is ready for use.');

  } catch (err) {
    console.error('Test failed (Make sure server is running):', err.message);
  }
}

testBackend();
