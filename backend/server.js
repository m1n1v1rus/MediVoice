require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { apiLimiter } = require('./config/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { startReminderScheduler } = require('./services/reminderService');

// Routes
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const callLogRoutes = require('./routes/callLogRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 10 * 1024 * 1024,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// API Routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/calls', callLogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io handler
require('./socket/socketHandler')(io);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`🚀 Backend running on port ${PORT}`);
  });

  // Start reminder cron job (silent)
  startReminderScheduler();
});