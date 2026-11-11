const mongoose = require('mongoose');

/**
 * Connects to MongoDB database using Mongoose
 * Reads MONGO_URI from environment variables
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`[MongoDB Connected]: ${conn.connection.host} | DB: ${conn.connection.name}`);

    // Lifecycle event listeners
    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB Runtime Error]: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Disconnected]: Attempting reconnection or standing by...');
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Exit process with failure in case DB is unreachable at startup
    process.exit(1);
  }
};

module.exports = connectDB;

