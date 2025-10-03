const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes  
const projectRoutes = require('./routes/projects.js');
const blockchainRoutes = require('./routes/blockchain.js');
const ipfsRoutes = require('./routes/ipfs.js');

// Import middleware
const logger = require('./middleware/logger.js');
const errorHandler = require('./middleware/errorHandler.js');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
});
app.use(limiter);

// Request logging middleware
app.use(logger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'neondb-connected',
      blockchain: 'operational',
      ipfs: 'operational'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Blue Carbon MRV Backend API',
    version: '1.0.0',
    description: 'Blockchain-based Monitoring, Reporting, and Verification system for blue carbon projects',
    endpoints: {
      health: '/health',
      projects: '/api/projects',
      blockchain: '/api/blockchain',
      ipfs: '/api/ipfs'
    },
    database: 'NeonDB PostgreSQL',
    documentation: 'https://github.com/blue-carbon-mrv/backend'
  });
});

// Mount API routes
app.use('/api/projects', projectRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/ipfs', ipfsRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join project room for updates
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`Socket ${socket.id} joined project ${projectId}`);
  });
  
  // Leave project room
  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`Socket ${socket.id} left project ${projectId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Note: Database connection is handled by the Python backend with NeonDB PostgreSQL
console.log('✅ Backend API ready - Database handled by Python service');

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Blue Carbon MRV Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API endpoints: http://localhost:${PORT}/api/`);
  console.log(`💬 Socket.IO ready for real-time connections`);
  console.log(`🐘 Database: NeonDB PostgreSQL (via Python backend)`);
});
