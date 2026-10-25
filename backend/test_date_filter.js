const http = require('http');
require('dotenv').config();

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

async function test() {
  try {
    console.log('--- Date Filter API Test ---');
    
    // 1. Login to get token
    const loginRes = await request('POST', '/api/v1/auth/login', {
      phone: '9999999999',
      password: 'admin123'
    });
    
    if (loginRes.status !== 200) {
      console.error('❌ Login Failed:', loginRes.body);
      return;
    }
    
    const token = loginRes.body.token;
    console.log('✅ Logged in as Admin');

    // 2. Fetch all tasks (no dates)
    const res1 = await request('GET', '/api/admin/tasks', null, token);
    console.log('\nTesting: GET /api/admin/tasks (No dates)');
    if (res1.status === 200) {
      console.log('✅ Response keys:', Object.keys(res1.body));
      console.log(`✅ Total Tasks: ${res1.body.totalTasks}`);
      console.log(`✅ Tasks array length: ${res1.body.tasks.length}`);
    } else {
      console.error('❌ Failed:', res1.body);
    }

    // 3. Fetch with date range (Today)
    const today = new Date();
    const start = new Date(today.setHours(0,0,0,0)).toISOString();
    const end = new Date(today.setHours(23,59,59,999)).toISOString();
    
    const path = `/api/admin/tasks?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`;
    console.log(`\nTesting: GET ${path}`);
    const res2 = await request('GET', path, null, token);
    
    if (res2.status === 200) {
      console.log('✅ Response keys:', Object.keys(res2.body));
      console.log(`✅ Total Tasks (Today): ${res2.body.totalTasks}`);
      console.log(`✅ Pending (Today): ${res2.body.pendingTasks}`);
      console.log(`✅ Completed (Today): ${res2.body.completedTasks}`);
    } else {
      console.error('❌ Failed:', res2.body);
    }

    console.log('\n🌟 Backend API Verification Successful!');
  } catch (err) {
    console.error('❌ Test Error:', err.message);
  }
}

test();
