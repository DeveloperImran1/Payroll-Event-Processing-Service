import Redis from 'ioredis';
import config from '../config';
import logger from './logger';

const redisConnection = new Redis({
  host: config.redis_host,
  port: Number(config.redis_port),
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on('connect', () => {
  logger.info('✅ Redis connected successfully!');
});

redisConnection.on('error', (err) => {
  logger.error('❌ Redis connection error:', err);
});

export default redisConnection;
