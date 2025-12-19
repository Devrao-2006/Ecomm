import { initApp } from './app.js';
import { logger } from './core/utils/logger.js';

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const app = await initApp();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

startServer();