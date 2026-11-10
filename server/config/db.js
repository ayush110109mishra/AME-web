const dns = require('dns');
const mongoose = require('mongoose');

// Configure public DNS servers only in development (fixes Windows local SRV lookup for Atlas)
if (process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Ignore in environments where setServers is restricted
  }
}

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  let mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ FATAL: MONGO_URI environment variable is missing.');
    process.exit(1);
  }

  if (isProduction && mongoUri === 'memory') {
    console.error('❌ FATAL: In-memory MongoDB is disabled in production.');
    process.exit(1);
  }

  // Connect to provided MONGO_URI
  if (mongoUri !== 'memory') {
    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Atlas connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      if (isProduction) {
        console.error('❌ FATAL: Production environment cannot fallback to in-memory database. Exiting.');
        process.exit(1);
      }
      if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
        console.error('👉 Reason: Atlas authentication failed. Please verify your Database User & Password in MongoDB Atlas > Database Access.');
      }
      console.log('🔄 Falling back to local in-memory MongoDB for development/testing...');
    }
  }

  // Fallback to MongoMemoryServer (Development & Test only)
  if (isProduction) {
    console.error('❌ FATAL: In-memory database fallback is not allowed in production.');
    process.exit(1);
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ Connected to local development MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`❌ In-memory MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
