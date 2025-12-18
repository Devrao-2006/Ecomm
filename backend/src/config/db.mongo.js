import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../core/utils/logger.js';

export async function connectMongo() {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI not set');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongoUri);
  logger.info('Connected to MongoDB');
}