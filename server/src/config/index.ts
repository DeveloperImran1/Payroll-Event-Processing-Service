import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  redis_host: process.env.REDIS_HOST || 'localhost',
  redis_port: process.env.REDIS_PORT || 6379,
};
