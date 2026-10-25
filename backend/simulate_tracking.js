const mongoose = require('mongoose');
const { io } = require('socket.io-client');
const dotenv = require('dotenv');
const { getMongoUri } = require('./config/mongoUri');
const User = require('./models/User');
const Location = require('./models/Location');

dotenv.config();

const simulateTracking = async () => {
  await mongoose.connect(getMongoUri());
  console.log('MongoDB Connected for Simulation');

  // Create 3 dummy staff members in Tamil Nadu
  const dummyStaff = [
    { name: 'Tracker Chennai', phone: '2222200001', password: 'dummy', role: 'Staff', lat: 13.0827, lng: 80.2707 }, // Chennai
    { name: 'Tracker Madurai', phone: '2222200002', password: 'dummy', role: 'Staff', lat: 9.9252, lng: 78.1198 }, // Madurai
    // Coimbatore tracker permanently removed
  ];

  const activeStaff = [];

  for (let s of dummyStaff) {
    let user = await User.findOne({ phone: s.phone });
    if (!user) {
      user = await User.create({
        name: s.name,
        phone: s.phone,
        password: s.password,
        role: 'Staff'
      });
      console.log(`Created dummy staff: ${s.name}`);
    }
    activeStaff.push({
      _id: user._id,
      name: user.name,
      lat: s.lat,
      lng: s.lng,
      baseLat: s.lat,
      baseLng: s.lng
    });
  }

  // Connect socket
  const socket = io('http://localhost:5000');
  
  socket.on('connect', () => {
    console.log('Simulation Socket Connected');

    setInterval(async () => {
      for (let staff of activeStaff) {
        // Random walk
        staff.lat += (Math.random() - 0.5) * 0.001;
        staff.lng += (Math.random() - 0.5) * 0.001;

        const timestamp = new Date();

        // 1. Emit via socket to update admin map live
        socket.emit('locationUpdate', {
          employeeId: staff._id,
          latitude: staff.lat,
          longitude: staff.lng,
          timestamp: timestamp.toISOString()
        });

        // 2. Update DB directly (simulating what the HTTP endpoint does)
        await User.findByIdAndUpdate(staff._id, {
          'location.lat': staff.lat,
          'location.lng': staff.lng,
          lastLocationTimestamp: timestamp
        });

        await Location.create({
          employeeId: staff._id,
          latitude: staff.lat,
          longitude: staff.lng,
          timestamp
        });

        console.log(`Pulsed ${staff.name} at ${staff.lat.toFixed(4)}, ${staff.lng.toFixed(4)}`);
      }
    }, 5000); // every 5 seconds
  });
};

simulateTracking();
