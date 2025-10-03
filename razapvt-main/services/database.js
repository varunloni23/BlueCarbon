const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query(text, params) {
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (err) {
      console.error('Database query error:', err);
      throw err;
    }
  }

  async getClient() {
    return await this.pool.connect();
  }

  // Project methods
  async createProject(projectData) {
    const {
      project_id,
      title,
      description,
      location,
      ecosystem_type,
      area_hectares,
      carbon_estimate,
      blockchain_tx_hash,
      ipfs_hash,
      workflow_id
    } = projectData;

    const query = `
      INSERT INTO projects (project_id, title, description, location, ecosystem_type, area_hectares, carbon_estimate, blockchain_tx_hash, ipfs_hash, workflow_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      project_id,
      title,
      description,
      JSON.stringify(location),
      ecosystem_type,
      area_hectares,
      carbon_estimate,
      blockchain_tx_hash,
      ipfs_hash,
      workflow_id
    ];

    const result = await this.query(query, values);
    return result.rows[0];
  }

  async getProject(projectId) {
    const query = 'SELECT * FROM projects WHERE project_id = $1';
    const result = await this.query(query, [projectId]);
    return result.rows[0];
  }

  async getAllProjects(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM projects 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await this.query(query, [limit, offset]);
    return result.rows;
  }

  async updateProject(projectId, updateData) {
    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const query = `
      UPDATE projects 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE project_id = $1 
      RETURNING *
    `;

    const values = [projectId, ...Object.values(updateData)];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  // Verification data methods
  async createVerificationData(verificationData) {
    const {
      project_id,
      verification_type,
      data,
      ai_score
    } = verificationData;

    const query = `
      INSERT INTO verification_data (project_id, verification_type, data, ai_score)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      project_id,
      verification_type,
      JSON.stringify(data),
      ai_score
    ];

    const result = await this.query(query, values);
    return result.rows[0];
  }

  async getVerificationData(projectId) {
    const query = 'SELECT * FROM verification_data WHERE project_id = $1 ORDER BY verified_at DESC';
    const result = await this.query(query, [projectId]);
    return result.rows;
  }

  // User methods
  async createUser(userData) {
    const { username, email, password_hash, role, wallet_address } = userData;

    const query = `
      INSERT INTO users (username, email, password_hash, role, wallet_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, role, wallet_address, created_at
    `;

    const values = [username, email, password_hash, role, wallet_address];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async getUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.query(query, [email]);
    return result.rows[0];
  }

  async getUserByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await this.query(query, [username]);
    return result.rows[0];
  }

  // Carbon credits methods
  async createCarbonCredit(creditData) {
    const {
      project_id,
      token_id,
      amount,
      price_per_credit,
      blockchain_tx_hash
    } = creditData;

    const query = `
      INSERT INTO carbon_credits (project_id, token_id, amount, price_per_credit, blockchain_tx_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [project_id, token_id, amount, price_per_credit, blockchain_tx_hash];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async getCarbonCredits(projectId) {
    const query = 'SELECT * FROM carbon_credits WHERE project_id = $1 ORDER BY created_at DESC';
    const result = await this.query(query, [projectId]);
    return result.rows;
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new DatabaseService();