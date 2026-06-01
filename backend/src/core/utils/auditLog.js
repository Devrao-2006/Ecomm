import { prisma } from '../../config/db.prisma.js';
import { logger } from './logger.js';

export async function logVerificationEvent({ userId, event, ip, userAgent, metadata }) {
  try {
    await prisma.verification_events.create({
      data: {
        user_id: userId,
        event,
        ip: ip ?? null,
        user_agent: userAgent ?? null,
        metadata: metadata ?? null
      }
    });
  } catch (err) {
    logger.error('[AuditLog] Failed to write verification event:', err.message);
  }
}
