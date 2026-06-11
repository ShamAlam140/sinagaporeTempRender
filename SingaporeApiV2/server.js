/**
 * Singapore High Commission Leave Management System — Advanced Backend Server
 * Version: 2.0
 *
 * Architecture:
 * - Atomic API operations (no multi-call dependency from frontend)
 * - Internal services (email, notifications, leave balance, calendar)
 * - Centralized error handling
 * - Environment-based configuration
 * - Backward compatible with existing Angular frontend
 */

require('dotenv').config();

// Validate environment variables immediately
const { validateEnv } = require('./config/validateEnv');
validateEnv();

const { initializeFirebase } = require('./config/firebase');
initializeFirebase();

const express = require('express');
const mongoose = require('mongoose');
const mcache = require('memory-cache');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const responseTime = require('response-time');

const { connectToDatabase } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ========= Initialize Express =========
const app = express();

// ========= Security Middleware =========
app.use(helmet());

// CORS — configure allowed origins from env (comma-separated) or allow all
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : '*';
app.use(cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(xss());
app.use(mongoSanitize());
app.use(responseTime((req, res, time) => {
    console.log(`⏱️  API TIME: ${req.method} ${req.originalUrl} — ${time.toFixed(2)}ms`);
}));

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 500,
    message: 'Too many requests, please try again later.',
});
app.use(limiter);

// ========= Body Parsing =========
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ========= Request Logging (Development) =========
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// ========= Connect to Database =========
connectToDatabase();

// ========= API Routes (same paths as original for backward compatibility) =========
app.use('/api/superadmin', require('./routes/superadmin'));
app.use('/api/manager', require('./routes/manager'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/holidays', require('./routes/holidays'));
app.use('/api/policy', require('./routes/policies'));
app.use('/api/covers', require('./routes/covers'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/leavereport', require('./routes/leavereport'));
app.use('/api/email', require('./routes/email'));

// ========= Health Check =========
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        version: '2.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ========= 404 Handler =========
app.use((req, res) => {
    res.status(404).json({ msg: `Route ${req.originalUrl} not found` });
});

// ========= Global Error Handler =========
app.use(errorHandler);

// ========= Start Server =========
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`🚀 Singapore LMS V2 Server running on port ${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
    console.log(`🔒 Security: Helmet, XSS, Mongo Sanitize, Rate Limit`);
    console.log(`🩺 Health: http://localhost:${PORT}/health`);
    console.log('===================================================');
});

// ========= Graceful Shutdown =========
const gracefulShutdown = (signal) => {
    console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        console.log('🔌 HTTP server closed.');
        try {
            await mongoose.connection.close();
            console.log('🗄️  MongoDB connection closed.');
        } catch (err) {
            console.error('❌ Error closing MongoDB:', err.message);
        }
        mcache.clear();
        console.log('🧹 Cache cleared.');
        console.log('👋 Goodbye!');
        process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
