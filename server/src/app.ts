import express from 'express';
import cors from 'cors';
import { config } from './config.ts';
import { errorHandler, notFoundHandler } from './http.ts';
import { authRouter } from './routes/auth.ts';
import { catalogRouter } from './routes/catalog.ts';
import { cartRouter } from './routes/cart.ts';
import { orderRouter } from './routes/orders.ts';
import { profileRouter } from './routes/profile.ts';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));

  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin and non-browser callers (curl, native apps) send no Origin.
        if (!origin || config.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin ${origin} is not allowed`));
      },
    })
  );

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'teedeux-mart-api' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/catalog', catalogRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/profile', profileRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
