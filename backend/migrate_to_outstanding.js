/**
 * Migrate all advance fields (advance_taken, advanceAmount) to advanceOutstanding
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { getMongoUri } = require('./config/mongoUri');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  try {
    const uri = getMongoUri();
    console.log('Connecting to MongoDB...', uri.replace(/:([^:@]+)@/, ':****@'));
    await mongoose.connect(uri);
    console.log('✅ Connected!\n');

    const users = await User.find({});
    console.log(`Checking ${users.length} users...`);

    for (const u of users) {
      const oldVal = u.advanceAmount !== undefined ? u.advanceAmount : (u.advance_taken !== undefined ? u.advance_taken : 0);
      
      console.log(`  👤 ${u.name} | Current advanceOutstanding: ${u.advanceOutstanding} | Migrating from: ${oldVal}`);
      
      await User.updateOne(
        { _id: u._id },
        { 
          $set: { advanceOutstanding: Number(oldVal) || 0 }, 
          $unset: { advanceAmount: '', advance_taken: '', advanceValue: '', advance: '' } 
        }
      );
    }

    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
