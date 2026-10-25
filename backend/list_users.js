/**
 * List all users to see names and advances
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { getMongoUri } = require('./config/mongoUri');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(getMongoUri());
    const users = await User.find({}).select('name phone role advanceOutstanding advanceAmount advance_taken');
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ${u.name} | ${u.phone} | ${u.role} | Advance: ${u.advanceOutstanding || u.advanceAmount || u.advance_taken || 0}`);
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
