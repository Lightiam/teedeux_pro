import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config } from './config.ts';

const location = config.databaseUrl === ':memory:' ? ':memory:' : resolve(config.databaseUrl);

if (location !== ':memory:') {
  mkdirSync(dirname(location), { recursive: true });
}

export const db = new DatabaseSync(location);

// WAL keeps reads from blocking on writes; foreign keys are off by default in
// SQLite and every cascade below depends on them.
if (location !== ':memory:') {
  db.exec('PRAGMA journal_mode = WAL');
}
db.exec('PRAGMA foreign_keys = ON');

/**
 * Schema is created idempotently on boot. The dataset is small and the shape is
 * stable, so a migration framework would be more machinery than this needs.
 */
export function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      email          TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash  TEXT NOT NULL,
      phone          TEXT,
      avatar_url     TEXT,
      is_plus_member INTEGER NOT NULL DEFAULT 0,
      wallet_balance REAL NOT NULL DEFAULT 0,
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      default_address TEXT,
      created_at     TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stores (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      rating         REAL NOT NULL DEFAULT 0,
      delivery_time  TEXT NOT NULL DEFAULT '',
      delivery_fee   TEXT NOT NULL DEFAULT '',
      min_order      TEXT NOT NULL DEFAULT '',
      tagline        TEXT NOT NULL DEFAULT '',
      image_url      TEXT NOT NULL DEFAULT '',
      is_featured    INTEGER NOT NULL DEFAULT 0,
      category_tags  TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS products (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      category       TEXT NOT NULL,
      price          REAL NOT NULL,
      currency       TEXT NOT NULL DEFAULT '$',
      weight_or_unit TEXT NOT NULL DEFAULT '',
      image_url      TEXT NOT NULL DEFAULT '',
      is_new_arrival INTEGER NOT NULL DEFAULT 0,
      store_id       TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      description    TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_products_store    ON products(store_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

    CREATE TABLE IF NOT EXISTS aisles (
      id       TEXT PRIMARY KEY,
      label    TEXT NOT NULL,
      icon     TEXT NOT NULL,
      tint     TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity   INTEGER NOT NULL CHECK (quantity > 0),
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id               TEXT PRIMARY KEY,
      user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      store_id         TEXT NOT NULL REFERENCES stores(id),
      status           TEXT NOT NULL,
      subtotal         REAL NOT NULL,
      delivery_fee     REAL NOT NULL,
      service_fee      REAL NOT NULL,
      discount         REAL NOT NULL DEFAULT 0,
      total            REAL NOT NULL,
      delivery_address TEXT NOT NULL,
      placed_at        TEXT NOT NULL,
      updated_at       TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, placed_at DESC);

    CREATE TABLE IF NOT EXISTS order_items (
      order_id       TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id     TEXT NOT NULL,
      name           TEXT NOT NULL,
      image_url      TEXT NOT NULL DEFAULT '',
      weight_or_unit TEXT NOT NULL DEFAULT '',
      unit_price     REAL NOT NULL,
      quantity       INTEGER NOT NULL CHECK (quantity > 0),
      PRIMARY KEY (order_id, product_id)
    );
  `);
}

/** Runs `fn` inside a transaction, rolling back if it throws. */
export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
