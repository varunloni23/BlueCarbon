const winston = require('winston');

// Configure Winston logger for error handling
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Determine error type and status code
  let statusCode = 500;
  let message = 'Internal server error';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.status) {
    statusCode = err.status;
    message = err.message;
  }

  // Send error response
  const errorResponse = {
    error: message,
    timestamp: new Date().toISOString()
  };

  // Include detailed error in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = err.message;
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
