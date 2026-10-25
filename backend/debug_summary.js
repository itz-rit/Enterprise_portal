/**
 * Debug Today Summary API
 */
require('dotenv').config();
const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: '127.0.0.1', port: 5000, path, method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(opts, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: buf ? JSON.parse(buf) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, body: buf });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  try {
    // 1. Login as Admin
    console.log('Logging in...');
    const adminLogin = await request('POST', '/api/v1/auth/login', { phone: '9876543210', password: '123456' });
    if (adminLogin.status !== 200) {
      console.log('❌ Login failed:', adminLogin.status, adminLogin.body);
      return;
    }
    const token = adminLogin.body.token;
    console.log('✅ Admin Logged In');

    // 2. Fetch Users
    const usersRes = await request('GET', '/api/admin/users', null, token);
    console.log('✅ Users API Status:', usersRes.status);

    // 3. Fetch Summary
    console.log('Fetching today summary...');
    const summaryRes = await request('GET', '/api/admin/attendance/today-summary', null, token);
    console.log('✅ Summary API Status:', summaryRes.status);
    console.log('   Body:', summaryRes.body);

    if (summaryRes.status === 200) {
      console.log('\n🌟 API IS WORKING CORRECTLY!');
    } else {
      console.log('\n❌ API FAILED!');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

run();
