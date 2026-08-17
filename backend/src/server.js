import { initApp } from './app.js';
import { logger } from './core/utils/logger.js';
import { startOrderExpiryWorker, stopOrderExpiryWorker } from './modules/order/orderExpiry.service.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const app = await initApp();
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      // Start background worker for expiring unpaid orders (runs every 60s, threshold 15m)
      startOrderExpiryWorker(60000, 15);
    });

    const shutdownApp = async () => {
      logger.info('Shutting down server gracefully...');
      stopOrderExpiryWorker();
      server.close();
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