const dns = require('dns');

// Automatically configure public DNS servers to fix Windows SRV resolution for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setServers is restricted
}

const mongoose = require('mongoose');

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  // Try connecting to provided MONGO_URI if not set to 'memory'
  if (mongoUri && mongoUri !== 'memory') {
    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Atlas connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`⚠️ MongoDB Atlas connection failed: ${error.message}`);
      if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
        console.error('👉 Reason: Atlas authentication failed. Please verify your Database User & Password in MongoDB Atlas > Database Access.');
      }
      console.log('🔄 Falling back to local in-memory MongoDB so the server keeps running...');
    }
  }

  // Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ Connected to local development MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
