/**
 * Smoke checks for the Cloud Functions Express app.
 *
 * Covers only the paths that never reach Firestore: health, routing, the 404
 * and error envelopes, zod validation, and auth rejection. Everything behind a
 * valid token needs the Firestore and Auth emulators — run those and use
 * server/test/api.test.mjs against the emulated endpoint for full coverage.
 *
 *   npm run build && npm test
 */
import http from 'node:http';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// Admin SDK needs a project id even when nothing is dialled.
process.env.GCLOUD_PROJECT ??= 'teedeux-mart';
process.env.FIRESTORE_EMULATOR_HOST ??= 'localhost:8080';

const require = createRequire(import.meta.url);
const { api } = require(resolve(here, '..', 'lib', 'index.js'));

const server = http.createServer(api);
await new Promise((done) => server.listen(0, done));
const { port } = server.address();
const BASE = `http://127.0.0.1:${port}`;

let pass = 0;
let fail = 0;
const check = (name, ok, detail = '') => {
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? ` -- ${detail}` : ''}`);
  }
};

async function call(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* some responses carry no body */
  }
  return { status: res.status, body: json };
}

console.log('\n== routing ==');
const health = await call('GET', '/health');
check('GET /health -> 200', health.status === 200, `got ${health.status}`);
check('reports firebase backend', health.body?.backend === 'firebase');

const missing = await call('GET', '/no-such-route');
check('unknown route -> 404', missing.status === 404, `got ${missing.status}`);
check('404 uses the error envelope', missing.body?.error?.code === 'not_found');

console.log('\n== auth rejection ==');
for (const [method, path] of [
  ['GET', '/cart'],
  ['POST', '/cart/items'],
  ['GET', '/orders'],
  ['POST', '/orders/checkout'],
  ['GET', '/profile'],
  ['GET', '/auth/me'],
]) {
  const res = await call(method, path);
  check(`${method} ${path} without token -> 401`, res.status === 401, `got ${res.status}`);
}

const garbage = await call('GET', '/cart', { token: 'not.a.real.token' });
check('invalid token -> 401', garbage.status === 401, `got ${garbage.status}`);
check('invalid token code', garbage.body?.error?.code === 'invalid_token');

console.log('\n== validation ==');
const badCategory = await call('GET', '/catalog/products?category=nope');
check('invalid category -> 400', badCategory.status === 400, `got ${badCategory.status}`);
check('validation error carries details', Array.isArray(badCategory.body?.error?.details));

const badLimit = await call('GET', '/catalog/products?limit=9999');
check('limit above max -> 400', badLimit.status === 400, `got ${badLimit.status}`);

const shortPw = await call('POST', '/auth/signup', {
  body: { name: 'Test', email: 'test@example.com', password: 'short' },
});
check('signup with short password -> 400', shortPw.status === 400, `got ${shortPw.status}`);

const badEmail = await call('POST', '/auth/signup', {
  body: { name: 'Test', email: 'not-an-email', password: 'longenoughpassword' },
});
check('signup with bad email -> 400', badEmail.status === 400, `got ${badEmail.status}`);

console.log(`\n${pass} passed, ${fail} failed`);
console.log('Firestore-backed paths are not covered here — they need the emulators.\n');

// Close before exiting, or Node can abort on a still-closing handle.
await new Promise((done) => server.close(done));
process.exitCode = fail === 0 ? 0 : 1;
