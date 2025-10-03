# 🚀 Complete Render Deployment Guide

## Overview
This guide will help you deploy your Blue Carbon MRV Backend to Render with PostgreSQL database, environment variables, and all necessary configurations.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Environment Variables**: Private keys, API keys, etc.

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Ensure all files are committed**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Verify these files exist**:
   - ✅ `render.yaml` (deployment configuration)
   - ✅ `package.json` (with start script)
   - ✅ `.env.example` (environment variables template)
   - ✅ `contract-addresses.json` (contract addresses)

### Step 2: Create Render Account & Connect GitHub

1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account
3. Grant access to your repository

### Step 3: Deploy Using render.yaml (Recommended)

1. **Go to Render Dashboard**
2. **Click "New +"** → **"Blueprint"**
3. **Connect your repository**
4. **Render will automatically detect `render.yaml`**
5. **Click "Apply"**

This will create:
- ✅ PostgreSQL database (`sih-postgres-db`)
- ✅ Web service (`sih-blue-carbon-backend`)
- ✅ Automatic environment variable setup

### Step 4: Configure Environment Variables

After deployment, go to your service settings and add these **CRITICAL** environment variables:

#### 🔐 Security-Critical Variables
```bash
PRIVATE_KEY=your_ethereum_private_key_here
JWT_SECRET=your_super_secure_jwt_secret_here
```

#### 🌐 IPFS Configuration (if using Infura)
```bash
IPFS_PROJECT_ID=your_infura_project_id
IPFS_PROJECT_SECRET=your_infura_project_secret
```

#### 📧 Email Configuration (optional)
```bash
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### Step 5: Database Setup

Your PostgreSQL database will be automatically created and connected. The connection string will be auto-populated in `DATABASE_URL`.

#### Database Tables
Run this SQL in your Render PostgreSQL dashboard to create tables:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    wallet_address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location JSONB,
    ecosystem_type VARCHAR(100),
    area_hectares DECIMAL(10,2),
    carbon_estimate DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'pending',
    blockchain_tx_hash VARCHAR(255),
    ipfs_hash VARCHAR(255),
    workflow_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification data table
CREATE TABLE verification_data (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) REFERENCES projects(project_id),
    verification_type VARCHAR(100),
    data JSONB,
    ai_score INTEGER,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carbon credits table
CREATE TABLE carbon_credits (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) REFERENCES projects(project_id),
    token_id VARCHAR(255),
    amount DECIMAL(15,2),
    price_per_credit DECIMAL(10,2),
    blockchain_tx_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_projects_project_id ON projects(project_id);
CREATE INDEX idx_verification_project_id ON verification_data(project_id);
CREATE INDEX idx_carbon_credits_project_id ON carbon_credits(project_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(wallet_address);
```

### Step 6: Alternative Manual Deployment

If you prefer manual setup:

1. **Create PostgreSQL Database**:
   - New → PostgreSQL
   - Name: `sih-postgres-db`
   - Plan: Starter (free)

2. **Create Web Service**:
   - New → Web Service
   - Connect your GitHub repo
   - Name: `sih-blue-carbon-backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables** (use the template from `.env.example`)

### Step 7: Verify Deployment

1. **Check Build Logs**: Ensure no errors during build
2. **Check Runtime Logs**: Look for successful startup messages
3. **Test Health Endpoint**: Visit `https://your-app.onrender.com/health`
4. **Test API Endpoints**: Visit `https://your-app.onrender.com/api`

Expected startup messages:
```
✅ Contract addresses loaded successfully
✅ Node.js backend ready - Database operations via Python backend
🚀 Blue Carbon MRV Backend Server running on port 8001
💚 Health check available at http://localhost:8001/health
```

## 🔧 Configuration Details

### Automatic Environment Variables
These are set automatically by Render:
- `PORT` (set by Render)
- `DATABASE_URL` (if using Render PostgreSQL)

### Required Manual Variables
Set these in Render dashboard:
- `PRIVATE_KEY` - Your Ethereum private key
- `JWT_SECRET` - Secure random string
- `NODE_ENV=production`

### Contract Addresses
These are loaded from `contract-addresses.json`:
- ProjectRegistry: `0x331A9336B7855E32B46F78053a963dc7FB6e3281`
- CarbonCreditToken: `0x50DB160bb4dfA789D600b5Be7eD80f66993b7620`
- And other contracts...

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check `package.json` has all dependencies
   - Verify Node.js version compatibility

2. **Database Connection Issues**:
   - Ensure `DATABASE_URL` is set correctly
   - Check PostgreSQL service is running

3. **Environment Variable Issues**:
   - Don't commit sensitive vars to Git
   - Use Render dashboard for secrets

4. **Contract Loading Issues**:
   - Ensure `contract-addresses.json` is in repo
   - Check file path in code

### Checking Logs
- Go to your service dashboard
- Click "Logs" tab
- Look for error messages

### Health Check
Visit: `https://your-app-name.onrender.com/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-19T...",
  "version": "1.0.0",
  "database": "connected",
  "blockchain": "connected"
}
```

## 📊 Monitoring & Scaling

### Free Tier Limitations
- Service sleeps after 15 minutes of inactivity
- 750 hours/month of runtime
- 512MB RAM, 0.5 CPU

### Upgrading for Production
- **Starter Plan**: $7/month - Always on, more resources
- **Standard Plan**: $25/month - More CPU, RAM, autoscaling

### Performance Tips
1. Enable compression (already configured)
2. Use Redis for caching (optional)
3. Monitor database queries
4. Set up proper logging

## 🔐 Security Checklist

- ✅ Environment variables set securely
- ✅ Database uses SSL in production
- ✅ CORS configured properly
- ✅ Rate limiting enabled
- ✅ JWT tokens secured
- ✅ Private keys not in code

## 🚀 Going Live

1. **Update CORS_ORIGIN** to your frontend domain
2. **Set up custom domain** (if needed)
3. **Configure SSL certificate** (automatic on Render)
4. **Set up monitoring** and alerts
5. **Test all API endpoints**

## 📞 Support

If you encounter issues:
1. Check Render documentation
2. Review build/runtime logs
3. Test locally first
4. Check environment variables

---

🎉 **Congratulations!** Your Blue Carbon MRV Backend is now deployed on Render!