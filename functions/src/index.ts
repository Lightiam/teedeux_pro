import express from 'express';
import cors from 'cors';
import { setGlobalOptions } from 'firebase-functions';
import { onRequest } from 'firebase-functions/v2/https';
import { CORS_ORIGINS } from './config.js';
import { errorHandler, notFoundHandler } from './http.js';
import { authRouter } from './routes/auth.js';
import { catalogRouter } from './routes/catalog.js';
import { cartRouter } from './routes/cart.js';
import { orderRouter } from './routes/orders.js';
import { profileRouter } from './routes/profile.js';

// One region keeps latency predictable and avoids cross-region Firestore reads.
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

app.use(
  cors({
    origin(origin, callback) {
      // Hosting rewrites and non-browser callers (native apps, curl) send no Origin.
      if (!origin || CORS_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed`));
    },
  })
);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'teedeux-mart-api', backend: 'firebase' });
});

app.use('/auth', authRouter);
app.use('/catalog', catalogRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);
app.use('/profile', profileRouter);

app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Single HTTPS function fronting the whole API.
 *
 * firebase.json rewrites /api/** here, so paths arrive without the /api prefix
 * and the routers above mount at the same paths the Express backend uses. One
 * function rather than many keeps cold starts to a single container.
 */
export const api = onRequest(app);
