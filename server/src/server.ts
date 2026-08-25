import app from './app';
import config from './config';
import './shared/redis'; // Initialize Redis connection
import { initWorker } from './app/jobs/eventWorker';
import logger from './shared/logger';

async function main() {
  try {
    // Start BullMQ Worker
    initWorker();

    app.listen(config.port, () => {
      logger.info(`🚀 Server is running on port ${config.port}`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
  }
}

main();
