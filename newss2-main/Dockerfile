# Use Node.js 18 (LTS) to avoid compatibility issues
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY frontend/package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# Copy source code
COPY frontend/ ./

# Build the application
RUN npm run build

# Serve with a simple server
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]