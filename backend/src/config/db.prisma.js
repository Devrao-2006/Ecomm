import { PrismaClient } from '@prisma/client';
import { logger } from '../core/utils/logger.js';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export async function connectPrisma() {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL via Prisma');
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL via Prisma', error);
    process.exit(1);
  }
}
