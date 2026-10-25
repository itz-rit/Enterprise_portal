/**
 * Test Admin Update API
 */
require('dotenv').config();
const http = require('http');

function httpPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = { hostname: '127.0.0.1', port: 5000, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } };
    const req = http.request(opts, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(buf) }));
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function httpPut(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = { hostname: '127.0.0.1', port: 5000, path, method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${token}`
      } };
    const req = http.request(opts, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(buf) }));
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

async function run() {
  try {
    // 1. Login as Admin
    const loginRes = await httpPost('/api/v1/auth/login', { phone: '9999999999', password: 'password123' });
    if (loginRes.status !== 200) {
      console.log('❌ Admin login failed', loginRes.body);
      return;
    }
    const token = loginRes.body.token;
    console.log('✅ Admin logged in');

    // 2. Identify Jane Smith (7777777777)
    // From my previous list, Jane's ID is 69c5358579b0fbbf8d158d8d
    const janeId = '69c5358579b0fbbf8d158d8d';
    
    // 3. Update Jane's Advance
    const updateRes = await httpPut(`/api/admin/users/${janeId}`, { advanceOutstanding: 1234 }, token);
    console.log('✅ Update Status:', updateRes.status);
    console.log('   Response Body:', JSON.stringify(updateRes.body, null, 2));

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

run();
