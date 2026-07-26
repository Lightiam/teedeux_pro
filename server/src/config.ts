import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * A fixed development secret keeps tokens valid across restarts. In production
 * a real secret is mandatory — booting without one would silently sign tokens
 * anybody could forge.
 */
function resolveJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET?.trim();
  if (fromEnv) return fromEnv;

  if (isProduction) {
    throw new Error('JWT_SECRET must be set when NODE_ENV=production');
  }
  return 'teedeux-dev-secret-do-not-use-in-production';
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  isProduction,
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  databaseUrl: process.env.DATABASE_URL ?? 'data/teedeux.db',

  /** Origins allowed to call the API with credentials. */
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:4300')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  /** Order pricing rules, kept here so the clients can't disagree with them. */
  pricing: {
    freeDeliveryThreshold: 35,
    deliveryFee: 3.99,
    serviceFee: 1.5,
  },

  /** Promo codes and the flat amount they take off an order. */
  promoCodes: {
    FRESH: 5,
    AFRICA10: 5,
  } as Record<string, number>,
} as const;
