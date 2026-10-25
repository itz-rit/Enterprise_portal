/**
 * Direct MongoDB diagnostic – runs independently of the HTTP server.
 * Usage: node check_mongo.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { getMongoUri } = require('./config/mongoUri');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  try {
    const uri = getMongoUri();
    console.log('Connecting to MongoDB…', uri.replace(/:([^:@]+)@/, ':****@'));
    await mongoose.connect(uri);
    console.log('✅ Connected!\n');

    const users = await User.find({}).select('name phone role base_salary advanceAmount advance_taken isActive');
    console.log(`Found ${users.length} user(s):\n`);
    users.forEach(u => {
      console.log(`  👤 ${u.name} | ${u.phone} | ${u.role}`);
      console.log(`     base_salary   : ${u.base_salary}`);
      console.log(`     advanceAmount : ${u.advanceAmount}`);
      console.log(`     advance_taken : ${u.advance_taken}  ← (old field, should be undefined)`);
      console.log(`     isActive      : ${u.isActive}`);
      console.log('');
    });

    // Find staff and patch any that still have old field
    const staffToFix = users.filter(u => u.advance_taken !== undefined && u.advanceAmount === undefined);
    if (staffToFix.length > 0) {
      console.log(`⚠️  ${staffToFix.length} user(s) still using old 'advance_taken' field. Migrating…`);
      for (const u of staffToFix) {
        await User.updateOne(
          { _id: u._id },
          { $set: { advanceAmount: u.advance_taken || 0 }, $unset: { advance_taken: '' } }
        );
        console.log(`   ✅ Migrated: ${u.name}`);
      }
    } else {
      console.log('✅ All users already use advanceAmount field correctly.');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

run();
