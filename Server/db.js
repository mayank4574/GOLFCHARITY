const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isPlaceholder = !uri || uri.includes('USERNAME:PASSWORD') || uri.includes('your_');

  if (isPlaceholder) {
    console.log('⚠️  No real MONGODB_URI — using in-memory MongoDB for dev');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      process._mongod = mongod;
      const memUri = mongod.getUri();
      await mongoose.connect(memUri, getOptions());
      console.log(`🗄️  In-memory MongoDB ready at: ${memUri}`);
    } catch (err) {
      console.error('Failed to start in-memory MongoDB:', err.message);
      process.exit(1);
    }
    return;
  }

  try {
    const conn = await mongoose.connect(uri, getOptions());
    const host = conn.connection.host;
    console.log(`✅ MongoDB Atlas Connected: ${host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Collections will be auto-indexed on first use`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error('   Check your MONGODB_URI in Server/.env');
    process.exit(1);
  }
};

// Optimal connection options for Atlas
function getOptions() {
  return {
    maxPoolSize: 10,           // Max 10 concurrent connections
    minPoolSize: 2,            // Keep 2 connections always open
    serverSelectionTimeoutMS: 10000,  // Give up selecting server after 10s
    socketTimeoutMS: 45000,    // Close idle sockets after 45s
    connectTimeoutMS: 10000,   // Time to establish initial connection
    heartbeatFrequencyMS: 10000, // Check server health every 10s
    retryWrites: true,
    retryReads: true,
  };
}

// ── Connection event handlers ─────────────────────────────────────────────────
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose: Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🟡 Mongoose: Disconnected from MongoDB');
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received — closing MongoDB connection...`);
  await mongoose.connection.close();
  if (process._mongod) await process._mongod.stop();
  console.log('✅ MongoDB connection closed. Goodbye!');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;
