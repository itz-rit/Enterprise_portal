const mongoose = require('mongoose');
const { getMongoUri } = require('./config/mongoUri');
const Reward = require('./models/Reward');
require('dotenv').config();

async function checkRewards() {
  try {
    await mongoose.connect(getMongoUri());
    const now = new Date();
    const today = new Date(now.setHours(0,0,0,0));
    const tomorrow = new Date(now.setHours(23,59,59,999));
    
    console.log('Today query range:', today.toISOString(), 'to', tomorrow.toISOString());
    
    const count = await Reward.countDocuments();
    const todayReward = await Reward.findOne({
      date: { $gte: today, $lte: tomorrow }
    });
    const last3 = await Reward.find().sort({date: -1}).limit(3);
    
    console.log('Total rewards:', count);
    console.log('Reward today:', todayReward);
    console.log('Last 3 rewards:', last3);
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRewards();
