#!/usr/bin/env node

/**
 * NeonDB Migration Script for Blue Carbon MRV System
 * Run this script to set up your PostgreSQL database tables
 */

const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🚀 Starting NeonDB migration...');
    
    const client = await pool.connect();
    
    // Drop existing tables if they exist (be careful in production!)
    const dropTablesQuery = `
      DROP TABLE IF EXISTS carbon_credits CASCADE;
      DROP TABLE IF EXISTS verification_data CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `;

    // Create tables
    const createTablesQuery = `
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
        status VARCHAR(50) DEFAULT 'submitted',
        blockchain_tx_hash VARCHAR(255),
        ipfs_hash VARCHAR(255),
        workflow_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Verification data table
      CREATE TABLE verification_data (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(255) REFERENCES projects(project_id) ON DELETE CASCADE,
        verification_type VARCHAR(100),
        data JSONB,
        ai_score INTEGER,
        verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Carbon credits table
      CREATE TABLE carbon_credits (
        id SERIAL PRIMARY KEY,
        project_id VARCHAR(255) REFERENCES projects(project_id) ON DELETE CASCADE,
        token_id VARCHAR(255),
        amount DECIMAL(15,2),
        price_per_credit DECIMAL(10,2),
        blockchain_tx_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX idx_projects_project_id ON projects(project_id);
      CREATE INDEX idx_projects_status ON projects(status);
      CREATE INDEX idx_projects_created_at ON projects(created_at);
      CREATE INDEX idx_verification_project_id ON verification_data(project_id);
      CREATE INDEX idx_credits_project_id ON carbon_credits(project_id);
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_username ON users(username);
    `;

    // Insert sample data
    const insertSampleDataQuery = `
      -- Insert sample admin user (password is 'admin123' hashed)
      INSERT INTO users (username, email, password_hash, role) VALUES 
      ('admin', 'admin@bluecarbonmrv.com', '$2b$10$rQ7J8mE8fHgRo8K9VxZN8uOKHkFxXzFxGcXdT7zR6yE3mQ5nW8pLa', 'admin');

      -- Insert sample project
      INSERT INTO projects (project_id, title, description, location, ecosystem_type, area_hectares, carbon_estimate, status) VALUES 
      ('PROJ-001', 'Mangrove Restoration Sundarbans', 'Large scale mangrove restoration project in the Sundarbans region', 
       '{"latitude": 21.9497, "longitude": 89.1833, "address": "Sundarbans, Bangladesh"}', 
       'mangroves', 500.00, 12500.00, 'verified');
    `;

    console.log('🗑️  Dropping existing tables...');
    await client.query(dropTablesQuery);
    
    console.log('🏗️  Creating tables...');
    await client.query(createTablesQuery);
    
    console.log('📊 Inserting sample data...');
    await client.query(insertSampleDataQuery);
    
    console.log('✅ Migration completed successfully!');
    console.log('📋 Created tables: users, projects, verification_data, carbon_credits');
    console.log('👤 Created admin user: admin@bluecarbonmrv.com (password: admin123)');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('💡 Please check your DATABASE_URL in .env file');
    console.error('💡 Make sure your NeonDB connection string is correct');
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrate();
}

module.exports = { migrate };