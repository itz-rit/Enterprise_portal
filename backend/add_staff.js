const mongoose = require('mongoose');
const { getMongoUri } = require('./config/mongoUri');
const User = require('./models/User');

const addStaff = async () => {
  try {
    await mongoose.connect(getMongoUri());
    console.log('MongoDB Connected successfully.');

    const newStaffList = [
      {
        name: 'Rajesh Kumar',
        phone: '9876500001',
        password: 'staff123',
        role: 'Staff',
        base_salary: 26000
      },
      {
        name: 'Amit Sharma',
        phone: '9876500002',
        password: 'staff123',
        role: 'Staff',
        base_salary: 27000
      }
    ];

    for (const staff of newStaffList) {
      // Check if user already exists
      const existingUser = await User.findOne({ phone: staff.phone });
      if (existingUser) {
        console.log(`Staff with phone ${staff.phone} already exists (${existingUser.name}).`);
      } else {
        const created = await User.create(staff);
        console.log(`Added staff: ${created.name} (Phone: ${created.phone}, Base Salary: ${created.base_salary})`);
      }
    }

    console.log('Staff addition completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error adding staff:', error);
    process.exit(1);
  }
};

addStaff();
