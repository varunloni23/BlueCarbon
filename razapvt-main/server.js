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
    origin: [
      "http://localhost:3000", 
      "http://localhost:8003", 
      "http://localhost:8004"
    ],
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:8003", 
    "http://localhost:8004"
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);

// Note: Database operations are handled by Python backend (NeonDB PostgreSQL)
console.log('ℹ️ Database operations delegated to Python backend on port 8002');

// Note: Database pool handled by Python backend - no local DB connection needed
console.log('✅ Node.js backend ready - Database operations via Python backend');

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('📱 Client connected:', socket.id);
  
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User joined project ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('📱 Client disconnected:', socket.id);
  });
});

// Import workflow integration
const { router: workflowRoutes, setupWebSocketEvents } = require('./routes/workflow.js');

// Setup workflow WebSocket events
setupWebSocketEvents(io);

// Make io available to routes
app.set('io', io);
global.io = io;

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/ipfs', ipfsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'handled-by-python-backend',
      blockchain: 'operational',
      ipfs: 'operational'
    },
    architecture: {
      role: 'auxiliary-services',
      database_provider: 'python-backend-neondb',
      main_api: 'http://localhost:8002'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Blue Carbon MRV System - Auxiliary Services',
    version: '1.0.0',
    role: 'Blockchain & IPFS Services',
    main_api: 'http://localhost:8002 (Python Backend)',
    available_endpoints: {
      health: '/health',
      projects: '/api/projects (limited)',
      blockchain: '/api/blockchain',
      ipfs: '/api/ipfs'
    },
    database: 'Handled by Python Backend (NeonDB PostgreSQL)'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5000;

// Initialize blockchain service
const blockchainService = require('./services/blockchainService.js');

// Startup function
async function startServer() {
  try {
    // Initialize blockchain service
    console.log('🔄 Initializing blockchain service...');
    const blockchainInitialized = await blockchainService.initialize();
    
    if (blockchainInitialized) {
      console.log('✅ Blockchain service ready');
      console.log('📍 Contract info:', blockchainService.getContractInfo());
    } else {
      console.warn('⚠️  Blockchain service initialization failed - some features may be limited');
    }

    server.listen(PORT, () => {
      console.log(`🚀 Blue Carbon MRV Backend Server running on port ${PORT}`);
      console.log(`💚 Health check available at http://localhost:${PORT}/health`);
      console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`⛓️  Blockchain: ${blockchainInitialized ? 'Connected' : 'Offline'}`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
