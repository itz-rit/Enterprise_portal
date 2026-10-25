/**
 * Diagnostic: Check Jane's specific record
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { getMongoUri } = require('./config/mongoUri');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(getMongoUri());
    const jane = await User.findOne({ name: /Jane/i });
    if (!jane) {
      console.log('❌ User Jane not found');
    } else {
      console.log('✅ Found Jane:');
      console.log('   - ID                 :', jane._id);
      console.log('   - Name               :', jane.name);
      console.log('   - Phone              :', jane.phone);
      console.log('   - advanceOutstanding :', jane.advanceOutstanding);
      console.log('   - advanceAmount      :', jane.advanceAmount);
      console.log('   - advance_taken      :', jane.advance_taken);
      console.log('   - Raw Document       :', JSON.stringify(jane, null, 2));
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
