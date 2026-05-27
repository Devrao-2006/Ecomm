import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DRY_RUN     = process.env.DRY_RUN === 'true';
const CUTOFF_DATE = process.env.CUTOFF_DATE
  ? new Date(process.env.CUTOFF_DATE)
  : new Date();

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('[Migration] MONGO_URI not set. Aborting.');
    process.exit(1);
  }

  console.log('[Migration] Connecting to MongoDB…');
  await mongoose.connect(mongoUri);
  console.log('[Migration] Connected.');

  const { User } = await import('../src/modules/user/user.model.js');

  const filter = {
    emailVerified: { $ne: true },
    createdAt: { $lte: CUTOFF_DATE },
  };

  const count = await User.countDocuments(filter);
  console.log(`[Migration] Found ${count} user(s) to grandfather (cutoff: ${CUTOFF_DATE.toISOString()})`);

  if (DRY_RUN) {
    console.log('[Migration] DRY_RUN mode – no changes written.');
    await mongoose.disconnect();
    return;
  }

  if (count === 0) {
    console.log('[Migration] Nothing to do.');
    await mongoose.disconnect();
    return;
  }

  const result = await User.updateMany(filter, {
    $set: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
  });

  console.log(`[Migration] ✓ Updated ${result.modifiedCount} user(s).`);
  await mongoose.disconnect();
  console.log('[Migration] Done.');
}

run().catch((err) => {
  console.error('[Migration] Fatal error:', err);
  process.exit(1);
});
