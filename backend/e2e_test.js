/**
 * Full E2E Async Test
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
      res.on('end', () => resolve({ status: res.statusCode, body: buf ? JSON.parse(buf) : {} }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  try {
    console.log('--- ADMIN UPDATE TEST ---');
    const adminLogin = await request('POST', '/api/v1/auth/login', { phone: '9876543210', password: '123456' });
    if (adminLogin.status !== 200) {
      console.log('❌ Admin Login Failed:', adminLogin.body);
      return;
    }
    const adminToken = adminLogin.body.token;
    console.log('✅ Admin Logged In');

    // Jane's ID from previous check: 69c5358579b0fbbf8d158d8d
    const janeId = '69c5358579b0fbbf8d158d8d';
    const newVal = Math.floor(Math.random() * 5000) + 1000;
    console.log(`Updating Jane (${janeId}) advanceOutstanding to: ${newVal}`);
    
    const updateRes = await request('PUT', `/api/admin/users/${janeId}`, { advanceOutstanding: newVal }, adminToken);
    console.log('✅ Update API Status:', updateRes.status);
    console.log('   Response advanceOutstanding:', updateRes.body.advanceOutstanding);

    console.log('\n--- STAFF FETCH TEST ---');
    const staffLogin = await request('POST', '/api/v1/auth/login', { phone: '9988776655', password: '123456' });
    if (staffLogin.status !== 200) {
      console.log('❌ Staff Login Failed:', staffLogin.body);
      return;
    }
    const staffToken = staffLogin.body.token;
    console.log('✅ Staff Logged In');
    console.log('   Login Response advanceOutstanding:', staffLogin.body.advanceOutstanding);

    const profileRes = await request('GET', '/api/staff/profile', null, staffToken);
    console.log('✅ Profile Fetch Status:', profileRes.status);
    console.log('   Profile advanceOutstanding:', profileRes.body.advanceOutstanding);

    if (profileRes.body.advanceOutstanding === newVal) {
      console.log('\n🌟 SUCCESS: Data is perfectly synced!');
    } else {
      console.log('\n❌ FAILURE: Data mismatch!');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

run();
