const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'AI JobMatch API is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Placeholder for future routes (Auth, Jobs, Resumes, Recommendations)
// app.use('/api/auth', authRoutes);
// app.use('/api/resumes', resumeRoutes);
// app.use('/api/jobs', jobRoutes);
// app.use('/api/recommendations', recommendationRoutes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;
