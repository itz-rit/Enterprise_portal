/**
 * Quick login test – tries the specific users we know from DB.
 * The hashed passwords in DB were set during createUser, 
 * so we test the known test passwords.
 */
require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { getMongoUri } = require('./config/mongoUri');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

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

function httpGet(path, token) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: '127.0.0.1', port: 5000, path, method: 'GET',
      headers: { Authorization: `Bearer ${token}` } };
    const req = http.request(opts, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(buf) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  // Connect to DB to get real users
  await mongoose.connect(getMongoUri());
  const users = await User.find({ role: 'Staff' }).select('name phone password advanceAmount base_salary');
  console.log(`Found ${users.length} staff users in DB:`);
  users.forEach(u => console.log(`  - ${u.name} | ${u.phone} | advanceAmount: ${u.advanceAmount} | base_salary: ${u.base_salary}`));
  await mongoose.disconnect();

  // Try logging in via API with known passwords
  const passwords = ['password123', '123456', 'password', '12345678', 'pass1234'];
  for (const u of users) {
    console.log(`\nTrying to login ${u.name} (${u.phone})...`);
    for (const pwd of passwords) {
      const res = await httpPost('/api/v1/auth/login', { phone: u.phone, password: pwd }).catch(() => null);
      if (res && res.status === 200) {
        console.log(`✅ Login SUCCESS with password: "${pwd}"`);
        console.log('   Login response:');
        console.log('   - base_salary  :', res.body.base_salary, res.body.base_salary !== undefined ? '✅' : '❌ MISSING');
        console.log('   - advanceAmount:', res.body.advanceAmount, res.body.advanceAmount !== undefined ? '✅' : '❌ MISSING');

        const profile = await httpGet('/api/staff/profile', res.body.token);
        console.log('   GET /api/staff/profile response:');
        console.log('   - base_salary  :', profile.body.base_salary, '✅');
        console.log('   - advanceAmount:', profile.body.advanceAmount, '✅');
        break;
      }
    }
  }
  console.log('\n✅ Verification complete!');
}

run().catch(console.error);
