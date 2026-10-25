const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { getMongoUri } = require('./config/mongoUri');

// Load environment variables
dotenv.config();

// Import Models
const User = require('./models/User');
const Task = require('./models/Task');
const Stock = require('./models/Stock');
const Transaction = require('./models/Transaction');

const seedData = async () => {
  try {
    await mongoose.connect(getMongoUri());
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany();
    await Task.deleteMany();
    await Stock.deleteMany();
    await Transaction.deleteMany();

    console.log('Old Data Cleared');

    // Create Admin User
    const admin = await User.create({
      name: 'System Admin',
      phone: '9876543210',
      password: '123456',
      role: 'Admin',
      base_salary: 50000
    });

    // Create Staff Users
    const staff1 = await User.create({
      name: 'John Doe',
      phone: '9988776655',
      password: '123456',
      role: 'Staff',
      base_salary: 25000
    });

    const staff2 = await User.create({
      name: 'Jane Smith',
      phone: '7777777777',
      password: 'staff123',
      role: 'Staff',
      base_salary: 28000
    });

    console.log('Users Created');

    // Create Tasks
    await Task.create([
      {
        clientName: 'ABC Corp',
        contactNumber: '9876543210',
        assignedTo: staff1._id,
        status: 'Pending',
        notes: 'Deliver docs',
      },
      {
        clientName: 'XYZ Ind.',
        contactNumber: '9876543211',
        assignedTo: staff2._id,
        status: 'Completed',
        notes: 'Signed contract',
      },
      {
        clientName: 'Global Tech',
        contactNumber: '9876543212',
        assignedTo: staff1._id,
        status: 'In Progress',
      },
    ]);

    // Create Stocks
    await Stock.create([
      { itemName: 'Sample Product A', quantity: 150, price: 1200 },
      { itemName: 'Demo Kit B', quantity: 45, price: 5000 },
    ]);

    // Create Transactions
    await Transaction.create([
      { userId: staff1._id, amount: 5000, type: 'Collection', description: 'Advance payment from ABC Corp' },
      { userId: staff2._id, amount: 1000, type: 'Advance', description: 'Travel expenses' },
    ]);

    console.log('Seed Data Successfully Inserted!');
    process.exit();

  } catch (err) {
    console.error('Error with seed data:', err);
    process.exit(1);
  }
};

seedData();
