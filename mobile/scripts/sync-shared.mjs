#!/usr/bin/env node
/**
 * Copies the web app's domain types into src/shared/.
 *
 * Metro will not resolve modules outside the Expo project root without a real
 * monorepo, and the repo is not laid out as one. Rather than fight the
 * resolver, the native app keeps its own copy and this script refreshes it.
 *
 *   npm run sync:shared
 *
 * Only types are shared now — catalog data and cart logic live on the server
 * and reach both clients over HTTP. Anything added here must be free of
 * DOM/browser dependencies.
 */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');
const webSrc = resolve(projectRoot, '..', 'src');
const target = join(projectRoot, 'src', 'shared');

/** Source file (relative to the web app's src/) → destination name. */
const FILES = [['types.ts', 'types.ts']];

const BANNER = `// GENERATED FILE - do not edit.
// Copied from the web app's src/ by "npm run sync:shared". Edit it there.
`;

await mkdir(target, { recursive: true });

for (const [from, to] of FILES) {
  const source = join(webSrc, from);
  const destination = join(target, to);

  let contents = await readFile(source, 'utf8');

  // Rewrite the web app's relative imports to sit flat in src/shared/.
  contents = contents
    .replace(/from '\.\.\/types'/g, "from './types'")
    .replace(/from '\.\/types'/g, "from './types'")
    .replace(/from '\.\.\/data\/mockData'/g, "from './mockData'");

  await writeFile(destination, BANNER + contents, 'utf8');
  console.log(`synced ${from} -> src/shared/${to}`);
}

console.log('done');
