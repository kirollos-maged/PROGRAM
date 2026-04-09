import { createClient } from 'redis';
import { env } from './env';

export function createRedisClient() {
  const client = createClient({ url: env.redisUrl });
  client.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('Redis client error', err);
  });
  return client;
}

