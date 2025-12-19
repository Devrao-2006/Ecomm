import pkg from 'pg';
import { env } from './env.js';
import { logger } from '../core/utils/logger.js';

const { Pool } = pkg;

export const pgPool = new Pool({
  connectionString: env.postgresUrl,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

export async function connectPostgres() {
  if (!env.postgresUrl) {
    throw new Error('POSTGRES_URL not set');
  }
  await pgPool.query('SELECT 1');
  logger.info('Connected to PostgreSQL');
}