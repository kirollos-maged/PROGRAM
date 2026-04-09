import 'dotenv/config';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  /** Default 4000 so Next.js can use 3000 without proxy conflicts in local dev */
  port: Number(process.env.PORT || 4000),
  postgresUrl: requireEnv('DATABASE_URL'),
  redisUrl: requireEnv('REDIS_URL'),
  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessTtl: '15m' as const,
    refreshTtl: '30d' as const,
  },
  tokens: {
    refreshTokenPepper: requireEnv('REFRESH_TOKEN_PEPPER'),
  },
  security: {
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 minutes
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  },
  cookies: {
    refreshTokenName: 'rtid',
  },
};

