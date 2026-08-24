import app from './app';
import config from './config';
import './shared/redis'; // Initialize Redis connection
import { initWorker } from './app/jobs/eventWorker';

async function main() {
  try {
    // Start BullMQ Worker
    initWorker();

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error(err);
  }
}

main();
