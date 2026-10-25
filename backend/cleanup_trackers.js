const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Location = require('./models/Location');

const cleanup = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/field_staff_system';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB...');

    // 1. Remove ALL dummy/simulation staff (any phone starting with 2222 or 1111)
    const dummyUsers = await User.find({ 
      phone: { $regex: /^(2222|1111)/ } 
    });
    const dummyIds = dummyUsers.map(u => u._id);
    console.log(`Found ${dummyUsers.length} dummy users:`, dummyUsers.map(u => `${u.name} (${u.phone})`));

    if (dummyIds.length > 0) {
      const delLoc = await Location.deleteMany({ employeeId: { $in: dummyIds } });
      console.log(`Deleted ${delLoc.deletedCount} location history records.`);
      
      const delUsers = await User.deleteMany({ _id: { $in: dummyIds } });
      console.log(`Deleted ${delUsers.deletedCount} dummy users.`);
    }

    // 2. Clear ALL location data from every user (fresh start)
    const clearLoc = await User.updateMany(
      { 'location.lat': { $exists: true } },
      { $unset: { location: '', lastLocationTimestamp: '' } }
    );
    console.log(`Cleared location fields from ${clearLoc.modifiedCount} user(s).`);

    // 3. Delete ALL location history documents
    const delAllLoc = await Location.deleteMany({});
    console.log(`Deleted ${delAllLoc.deletedCount} total location history records.`);

    // 4. Show remaining clean users
    const remaining = await User.find({}, 'name phone role location');
    console.log('\nClean users remaining:');
    remaining.forEach(u => {
      const loc = u.location?.lat ? `${u.location.lat.toFixed(4)}, ${u.location.lng.toFixed(4)}` : 'None';
      console.log(`  ✓ ${u.name} (${u.role}) | ${u.phone} | Loc: ${loc}`);
    });

    console.log('\n✅ Database fully cleaned!');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
};

cleanup();
