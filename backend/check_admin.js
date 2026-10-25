const mongoose = require('mongoose');
const User = require('./models/User');
const { getMongoUri } = require('./config/mongoUri');
require('dotenv').config();

async function checkAdmin() {
  await mongoose.connect(getMongoUri());
  const admins = await User.find({ role: 'Admin' });
  console.log('Admins found:', admins.map(a => ({ phone: a.phone, name: a.name })));
  process.exit();
}

checkAdmin();
