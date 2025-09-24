import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import chalk from 'chalk';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import promMid from 'express-prometheus-middleware';
import { register } from 'prom-client'; // Import Prometheus client

import cors from './config/corsConfig.js';
import './config/mongodb.js';
import { displayStartupMessage } from './config/start.js';
import passportConfig from './config/passport.js';
import userRoutes from './Router/user.js';
import uploadRouter from './Router/upload.js';
import backRouter from "./Router/Back.js"
import { initializeSocket, io } from './config/socket.js';

// Display startup banner
displayStartupMessage();

// Initialize Express
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO before using `io`
initializeSocket(server);

// Server Port
const PORT = process.env.PORT || 5000;

// Prometheus Middleware for Metrics
app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors);
app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecretkey', // Use environment variable for security
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true
  }
}));

// Initialize Passport
app.use(passport.initialize());
passportConfig(passport);

// Custom Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const logTime = new Date().toLocaleString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const methodColor = {
      'GET': chalk.green,
      'POST': chalk.blue,
      'PUT': chalk.yellow,
      'DELETE': chalk.red
    }[req.method] || chalk.white;

    const statusColor = res.statusCode >= 500 ? chalk.red :
                        res.statusCode >= 400 ? chalk.yellow :
                        res.statusCode >= 300 ? chalk.cyan :
                        chalk.green;

    console.log(
      `\n${chalk.bgWhite.black(' LOG ')} ${methodColor(req.method)} ${chalk.bold(req.path)}` +
      `\nStatus: ${statusColor(res.statusCode)}` +
      `\nTime: ${chalk.gray(logTime)}` +
      `\nDuration: ${chalk.magenta(duration + 'ms')}\n`
    );
  });

  next();
});

// Route to Emit a Socket Event
app.post('/notify', (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    if (!io) {
        console.error("⚠️ Socket.IO instance is not initialized!");
        return res.status(500).json({ error: "Socket.IO not initialized" });
    }

    try {
        io.emit('notification', { message }); // Emit event to all connected clients
        res.json({ success: true, message: "Notification sent successfully" });
    } catch (err) {
        console.error("Error emitting notification:", err);
        res.status(500).json({ error: "Failed to send notification" });
    }
});

// Metrics Route
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        console.error("Error fetching metrics:", err);
        res.status(500).json({ error: "Failed to retrieve metrics" });
    }
});

// Use Routes
app.use("/frontend", uploadRouter);
app.use("/backend", backRouter);
app.use('/user', userRoutes);

// Root Route
app.get('/', (req, res) => {
  console.log("log....")
  res.send("🚀 Server is live with Socket.IO and Prometheus Metrics!");
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ error: '404 - Page Not Found' });
});

// Start the Server
server.listen(PORT, () => {
    console.log(`✅ Server running at: ${chalk.cyan(`http://localhost:${PORT}/`)}`);
});
