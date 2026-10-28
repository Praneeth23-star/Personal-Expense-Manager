const mongoose = require('mongoose');

global.isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_manager';

  try {
    // Attempt standard connection with 1.5s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    global.isMongoConnected = true;
    console.log(`✅ MongoDB connected successfully to: ${uri}`);
  } catch (err) {
    global.isMongoConnected = false;
    console.log(`ℹ️ External MongoDB not active (${err.message}).`);
    console.log(`⚡ Activated high-speed file-backed local database engine!`);
  }
};

const disconnectDB = async () => {
  if (global.isMongoConnected) {
    try {
      await mongoose.disconnect();
    } catch (e) {}
  }
};

module.exports = { connectDB, disconnectDB };
