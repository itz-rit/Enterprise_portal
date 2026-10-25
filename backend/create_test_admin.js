const mongoose = require('mongoose');
const User = require('./models/User');
const { getMongoUri } = require('./config/mongoUri');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(getMongoUri());
    
    // Check if admin already exists
    const existing = await User.findOne({ phone: '9876543210' });
    if (existing) {
      await User.deleteOne({ _id: existing._id });
      console.log('Old test admin removed');
    }

    const admin = new User({
      name: 'Pradeep Admin',
      phone: '9876543210',
      password: '123456',
      role: 'Admin',
      base_salary: 50000
    });

    await admin.save();
    console.log('Test Admin created: 9876543210 / 123456');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
