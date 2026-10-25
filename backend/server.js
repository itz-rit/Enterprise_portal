const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

// Load env vars FIRST before anything else
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Expose io object to routes if needed
app.set('io', io);

// Socket.io handlers
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Handle a user joining their personal room or a global room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle location payload from staff
  socket.on('locationUpdate', async (data) => {
    // Expected data: { employeeId, latitude, longitude, timestamp }
    io.emit('locationUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ── MIDDLEWARE ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
if (process.env.NODE_ENV === 'production') {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  // Keep public login attempts throttled without blocking authenticated staff/admin APIs.
  app.use('/api/v1/auth', authLimiter);
}
app.use(cors());
app.use(express.json({ limit: '10mb' })); // limit payload size
app.use('/uploads', express.static('uploads'));

// ── AUTH ROUTE (shared) ────────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/authRoutes'));

// ── ADMIN ROUTES (/api/admin/*) ────────────────────────────────────────
// All protected by: protect + admin middleware inside each route file
app.use('/api/admin/users',        require('./routes/admin/userRoutes'));
app.use('/api/admin/tasks',        require('./routes/admin/taskRoutes'));
app.use('/api/admin/attendance',   require('./routes/admin/attendanceRoutes'));
app.use('/api/admin/stocks',       require('./routes/admin/stockRoutes'));
app.use('/api/admin/transactions', require('./routes/admin/transactionRoutes'));
app.use('/api/admin/reports',      require('./routes/admin/reportRoutes'));
app.use('/api/admin/performance',  require('./routes/performanceRoutes'));

// ── STAFF ROUTES (/api/staff/*) ────────────────────────────────────────
// All protected by: protect middleware, data scoped to req.user._id
app.use('/api/staff/tasks',        require('./routes/staff/taskRoutes'));
app.use('/api/staff/attendance',   require('./routes/staff/attendanceRoutes'));
app.use('/api/staff/profile',      require('./routes/staff/profileRoutes'));
app.use('/api/staff/transactions', require('./routes/staff/transactionRoutes'));

// ── COMMUNICATION ROUTES (/api/v1/communi/*) ───────────────────────────
app.use('/api/v1/communi', require('./routes/communicationRoutes'));

// ── LOCATION ROUTES (/api/v1/location) ─────────────────────────────────
app.use('/api/v1/location', require('./routes/locationRoutes'));

// ── SETTINGS ROUTES (/api/v1/settings) ─────────────────────────────────
app.use('/api/v1/settings', require('./routes/settingsRoutes'));

// ── STAFF STOCK ROUTES (/api/v1/staff-stock) ───────────────────────────
app.use('/api/v1/staff-stock', require('./routes/staffStockRoutes'));

// ── HEALTH CHECK ───────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'API is running', version: '1.0.0' }));

// ── ERROR HANDLING ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ── 404 HANDLER ────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
