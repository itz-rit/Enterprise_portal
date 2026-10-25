const mongoose = require('mongoose');
const { getMongoUri } = require('./mongoUri');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(getMongoUri());
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
