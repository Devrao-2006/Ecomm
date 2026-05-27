import { pgPool } from '../../config/db.postgres.js';
import { logger } from './logger.js';

export async function logVerificationEvent({ userId, event, ip, userAgent, metadata }) {
  try {
    await pgPool.query(
      `INSERT INTO verification_events (user_id, event, ip, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, event, ip ?? null, userAgent ?? null, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (err) {
    logger.error('[AuditLog] Failed to write verification event:', err.message); // non-fatal audit log failure
  }
}
