import { initApp } from './app.js';
import { logger } from './core/utils/logger.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const app = await initApp();
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    const shutdownApp = async () => {
      logger.info('Shutting down server gracefully...');
      server.close();
      // DB connections could be closed here if exported
      process.exit(0);
    };

    process.on('SIGTERM', shutdownApp);
    process.on('SIGINT', shutdownApp);
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

startServer();