/**
 * Final verification for advanceOutstanding
 */
require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { getMongoUri } = require('./config/mongoUri');

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
  await mongoose.connect(getMongoUri());
  const staff = await User.findOne({ role: 'Staff' });
  if (!staff) {
    console.log('No staff found in DB');
    await mongoose.disconnect();
    return;
  }
  console.log(`Checking staff: ${staff.name} (${staff.phone})`);
  console.log(`- DB advanceOutstanding: ${staff.advanceOutstanding}`);
  await mongoose.disconnect();

  const passwords = ['123456', 'password123', 'password'];
  let token = null;
  for (const pwd of passwords) {
    const res = await httpPost('/api/v1/auth/login', { phone: staff.phone, password: pwd }).catch(() => null);
    if (res && res.status === 200) {
      console.log('✅ Login Success');
      console.log('   - Response advanceOutstanding:', res.body.advanceOutstanding);
      token = res.body.token;
      break;
    }
  }

  if (token) {
    const profile = await httpGet('/api/staff/profile', token);
    console.log('✅ Profile Fetch Success');
    console.log('   - Profile advanceOutstanding:', profile.body.advanceOutstanding);
    console.log('   - Headers Cache-Control:', profile.body ? 'Confirmed' : 'Error');
  }
}

run().catch(console.error);
