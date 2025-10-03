#!/usr/bin/env node

/**
 * Add missing columns to NeonDB projects table
 */

const { Pool } = require('pg');
require('dotenv').config();

async function addMissingColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔄 Adding missing columns to projects table...');
    
    const client = await pool.connect();
    
    // Add missing columns
    const addColumnsQuery = `
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS ipfs_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS workflow_id VARCHAR(255);
    `;

    await client.query(addColumnsQuery);
    
    console.log('✅ Successfully added ipfs_hash and workflow_id columns');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Failed to add columns:', error.message);
    process.exit(1);
  }
}

// Run the update
if (require.main === module) {
  addMissingColumns();
}

module.exports = { addMissingColumns };