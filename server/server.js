const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database and then start listening
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[AI JobMatch Server]: Listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`[Health Endpoint]: http://localhost:${PORT}/api/health`);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection]: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err) => {
      console.error(`[Uncaught Exception]: ${err.message}`);
      process.exit(1);
    });
  } catch (err) {
    console.error(`[Fatal Startup Error]: ${err.message}`);
    process.exit(1);
  }
};

startServer();
