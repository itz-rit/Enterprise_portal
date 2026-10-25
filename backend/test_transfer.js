/**
 * Test Task Transfer API
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
    // 1. Login as Admin
    const adminLogin = await request('POST', '/api/v1/auth/login', { phone: '9876543210', password: '123456' });
    const token = adminLogin.body.token;
    console.log('✅ Admin Logged In');

    // 2. Create a test task assigned to Jane Smith (7777777777)
    // Jane ID: 69c5358579b0fbbf8d158d8d
    // John ID: 69c5358579b0fbbf8d158d8c (Probable, let's fetch first)
    
    const usersRes = await request('GET', '/api/admin/users', null, token);
    const jane = usersRes.body.find(u => u.phone === '7777777777');
    const john = usersRes.body.find(u => u.phone === '9988776655');
    
    console.log(`Jane ID: ${jane._id}, John ID: ${john._id}`);

    const taskRes = await request('POST', '/api/admin/tasks', {
      clientName: 'Transfer Test Client',
      contactNumber: '1234567890',
      assignedTo: jane._id,
      notes: 'Initial assignment to Jane'
    }, token);
    const taskId = taskRes.body._id;
    console.log(`✅ Task Created: ${taskId} (Assigned to Jane)`);

    // 3. Transfer to John Doe
    console.log('Transferring task to John...');
    const transferRes = await request('PUT', `/api/admin/tasks/${taskId}/transfer`, {
      newStaffId: john._id,
      note: 'Reassigning for verification'
    }, token);

    console.log('✅ Transfer Response Status:', transferRes.status);
    console.log('   New Assigned To:', transferRes.body.assignedTo.name);
    console.log('   Transfer History Length:', transferRes.body.transferHistory.length);
    console.log('   History Note:', transferRes.body.transferHistory[0].note);

    if (transferRes.body.assignedTo._id === john._id && transferRes.body.transferHistory.length === 1) {
      console.log('\n🌟 BACKEND TEST PASSED!');
    } else {
      console.log('\n❌ BACKEND TEST FAILED!');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

run();
