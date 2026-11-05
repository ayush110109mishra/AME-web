const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Fallback to MongoMemoryServer if memory requested or no URI provided
    if (!mongoUri || mongoUri === 'memory') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        console.log('Running with MongoMemoryServer for local dev / testing');
      } catch (err) {
        console.error('MongoMemoryServer fallback error:', err.message);
      }
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

