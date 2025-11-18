import { Pool, PoolClient } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5433';  // Test database port
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_NAME = 'modelia_ai_test';
process.env.DB_SSL = 'false';

// Global test timeout
jest.setTimeout(30000);

// Create a separate pool for tests
const testPool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: false,
});

let client: PoolClient;
export let testDb: NodePgDatabase<typeof schema>;

// Setup database connection and create tables
beforeAll(async () => {
  // Get a client from the pool
  client = await testPool.connect();
  
  // Wait for database to be ready with retries
  let retries = 10;
  while (retries > 0) {
    try {
      await client.query('SELECT 1');
      break;
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Create tables if they don't exist
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS generations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      prompt TEXT NOT NULL,
      style VARCHAR(50) NOT NULL,
      image_url TEXT NOT NULL,
      result_url TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);
});

// Start transaction before each test
beforeEach(async () => {
  await client.query('BEGIN');
  // Create a Drizzle instance with the transaction client
  testDb = drizzle(client, { schema });
});

// Rollback transaction after each test
afterEach(async () => {
  await client.query('ROLLBACK');
});

// Cleanup after all tests
afterAll(async () => {
  client.release();
  await testPool.end();
});

// Mock logger to avoid noise in tests
jest.mock('../config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));
