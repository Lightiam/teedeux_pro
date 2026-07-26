/**
 * Exports the web app's catalog fixtures to functions/fixtures.json.
 *
 * The fixtures live in src/data/mockData.ts as TypeScript. The seed script runs
 * as compiled JS inside the Functions runtime, so rather than reach across
 * directories at runtime, this step flattens the catalog to JSON once.
 * Re-run after editing the catalog:
 *
 *   npm run export:fixtures
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mockAisles, mockProducts, mockStores } from '../../src/data/mockData';

const here = dirname(fileURLToPath(import.meta.url));

const fixtures = {
  stores: mockStores,
  products: mockProducts,
  aisles: mockAisles,
};

const target = resolve(here, '..', 'fixtures.json');
writeFileSync(target, `${JSON.stringify(fixtures, null, 2)}\n`, 'utf8');

console.log(
  `exported ${fixtures.stores.length} hubs, ${fixtures.products.length} products, ` +
    `${fixtures.aisles.length} aisles -> functions/fixtures.json`
);
