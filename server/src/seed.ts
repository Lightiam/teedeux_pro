/**
 * Seeds the database from the web app's mock catalog.
 *
 * Idempotent: stores, products and aisles are upserted, so re-running refreshes
 * the catalog without disturbing users, carts or orders.
 *
 *   npm run seed
 */
import { db, migrate, transaction } from './db.ts';
import { hashPassword, newId } from './auth.ts';
import { users } from './repository.ts';
import {
  mockAisles,
  mockProducts,
  mockStores,
  mockUserProfile,
} from '../../src/data/mockData.ts';

const DEMO_PASSWORD = 'teedeux1234';

migrate();

const now = new Date().toISOString();

transaction(() => {
  const upsertStore = db.prepare(
    `INSERT INTO stores (id, name, rating, delivery_time, delivery_fee, min_order,
                         tagline, image_url, is_featured, category_tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name, rating = excluded.rating,
       delivery_time = excluded.delivery_time, delivery_fee = excluded.delivery_fee,
       min_order = excluded.min_order, tagline = excluded.tagline,
       image_url = excluded.image_url, is_featured = excluded.is_featured,
       category_tags = excluded.category_tags`
  );

  for (const store of mockStores) {
    upsertStore.run(
      store.id,
      store.name,
      store.rating,
      store.deliveryTime,
      store.deliveryFee,
      store.minOrder,
      store.tagline,
      store.imageUrl,
      store.isFeatured ? 1 : 0,
      JSON.stringify(store.categoryTags)
    );
  }

  const upsertProduct = db.prepare(
    `INSERT INTO products (id, name, category, price, currency, weight_or_unit,
                           image_url, is_new_arrival, store_id, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name, category = excluded.category, price = excluded.price,
       currency = excluded.currency, weight_or_unit = excluded.weight_or_unit,
       image_url = excluded.image_url, is_new_arrival = excluded.is_new_arrival,
       store_id = excluded.store_id, description = excluded.description`
  );

  for (const product of mockProducts) {
    upsertProduct.run(
      product.id,
      product.name,
      product.category,
      product.price,
      product.currency,
      product.weightOrUnit,
      product.imageUrl,
      product.isNewArrival ? 1 : 0,
      product.storeId,
      product.description ?? null
    );
  }

  const upsertAisle = db.prepare(
    `INSERT INTO aisles (id, label, icon, tint, position)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       label = excluded.label, icon = excluded.icon,
       tint = excluded.tint, position = excluded.position`
  );

  mockAisles.forEach((aisle, index) => {
    upsertAisle.run(aisle.id, aisle.label, aisle.icon, aisle.tint, index);
  });
});

console.log(
  `seeded ${mockStores.length} hubs, ${mockProducts.length} products, ${mockAisles.length} aisles`
);

// A demo account, created once, with a delivered order so "buy it again" has
// history to draw on.
const existing = users.byEmail(mockUserProfile.email);

if (existing) {
  console.log(`demo user already present: ${mockUserProfile.email}`);
} else {
  const userId = newId('usr');
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  transaction(() => {
    db.prepare(
      `INSERT INTO users (id, name, email, password_hash, phone, avatar_url,
                          is_plus_member, wallet_balance, loyalty_points,
                          default_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      userId,
      mockUserProfile.name,
      mockUserProfile.email,
      passwordHash,
      mockUserProfile.phone,
      mockUserProfile.avatarUrl,
      mockUserProfile.isPlusMember ? 1 : 0,
      mockUserProfile.walletBalance,
      mockUserProfile.loyaltyPoints,
      mockUserProfile.defaultAddress,
      now
    );

    // One delivered order per hub represented in the sample basket.
    const history = mockProducts.slice(0, 6);
    const byStore = new Map<string, typeof history>();

    for (const product of history) {
      const bucket = byStore.get(product.storeId);
      if (bucket) bucket.push(product);
      else byStore.set(product.storeId, [product]);
    }

    for (const [storeId, items] of byStore) {
      const orderId = newId('ord');
      const subtotal = items.reduce((sum, p) => sum + p.price, 0);
      const total = Math.round((subtotal + 1.5) * 100) / 100;

      db.prepare(
        `INSERT INTO orders (id, user_id, store_id, status, subtotal, delivery_fee,
                             service_fee, discount, total, delivery_address,
                             placed_at, updated_at)
         VALUES (?, ?, ?, 'delivered', ?, 0, 1.5, 0, ?, ?, ?, ?)`
      ).run(
        orderId,
        userId,
        storeId,
        Math.round(subtotal * 100) / 100,
        total,
        mockUserProfile.defaultAddress,
        now,
        now
      );

      const insertItem = db.prepare(
        `INSERT INTO order_items (order_id, product_id, name, image_url,
                                  weight_or_unit, unit_price, quantity)
         VALUES (?, ?, ?, ?, ?, ?, 1)`
      );

      for (const product of items) {
        insertItem.run(
          orderId,
          product.id,
          product.name,
          product.imageUrl,
          product.weightOrUnit,
          product.price
        );
      }
    }
  });

  console.log(`demo user created: ${mockUserProfile.email} / ${DEMO_PASSWORD}`);
}
