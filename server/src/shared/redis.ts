import Redis from 'ioredis';
import config from '../config';

const redisConnection = new Redis({
  host: config.redis_host,
  port: Number(config.redis_port),
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on('connect', () => {
  console.log('✅ Redis connected successfully!');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redisConnection;
