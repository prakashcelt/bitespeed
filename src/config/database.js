const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration
const pool = new Pool({
  // Use DATABASE_URL if provided (Render/production) or individual variables (local)
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bitespeed',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Celt@1234',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database successfully');
    console.log(`🗄️  Database: ${client.database}`);
    client.release();
  } catch (err) {
    console.error('❌ Error connecting to PostgreSQL database:', err.message);
  }
};

module.exports = {
  pool,
  testConnection
};
