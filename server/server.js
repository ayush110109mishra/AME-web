/* Crafted by Ayush Mishra */
const path = require('path');
const dotenv = require('dotenv');

// Load env variables
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const announcementRoutes = require('./routes/announcements');
const galleryRoutes = require('./routes/gallery');

const app = express();

// Trust reverse proxy (Render, Heroku, etc.) for rate limiters and secure cookies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Cross-Origin Resource Sharing (multi-origin support + dev localhost fallback)
const getAllowedOrigins = () => {
  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    if (!configured.includes('http://localhost:5173')) {
      configured.push('http://localhost:5173');
    }
  }
  return configured;
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.length === 0 || allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoints for Render and monitoring
const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AME API running',
    data: null,
  });
};

app.get('/', healthCheck);
app.get('/api/health', healthCheck);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/gallery', galleryRoutes);

// Catch 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
    data: null,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);

  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: process.env.NODE_ENV === 'production' ? null : { stack: err.stack },
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    // Validate critical environment variables
    if (!process.env.JWT_SECRET) {
      console.error('❌ FATAL: JWT_SECRET environment variable is missing.');
      process.exit(1);
    }

    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server failed to start:', err.message);
    process.exit(1);
  }
};

// Start server if not running inside test harness
if (process.env.NODE_ENV !== 'test') {
  start();
}

module.exports = app;
