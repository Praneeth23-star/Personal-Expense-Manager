
const mongoose = require('mongoose');

global.isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing from environment variables');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    global.isMongoConnected = true;
    console.log('MongoDB Atlas connected successfully!');
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (err) {
    global.isMongoConnected = false;
    console.error('MongoDB Atlas connection failed:', err.message);
    throw err;
  }
};

const disconnectDB = async () => {
  if (global.isMongoConnected) {
    await mongoose.disconnect();
    global.isMongoConnected = false;
  }
};

module.exports = { connectDB, disconnectDB };
