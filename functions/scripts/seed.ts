/**
 * Seeds Firestore from the web app's mock catalog.
 *
 * Idempotent: stores, products and aisles are written with merge, so re-running
 * refreshes the catalog without disturbing users, carts or orders.
 *
 * Against the emulator:
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 \
 *   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
 *   GCLOUD_PROJECT=teedeux-mart npm run seed
 *
 * Against a real project:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
 *   GCLOUD_PROJECT=your-project-id npm run seed
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLLECTIONS } from '../src/config.js';
import { auth, buildSearchTokens, db } from '../src/firestore.js';
import type { Aisle, Product, Store } from '../src/types.js';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * The fixtures live in the web app as a TypeScript module. Reading them as text
 * and evaluating the arrays would drag a transpiler into this script, so the
 * seed reads a JSON export instead. Regenerate it with:
 *   npm run export:fixtures
 */
interface Fixtures {
  stores: Store[];
  products: Product[];
  aisles: Aisle[];
}

const fixturesPath = resolve(here, '..', 'fixtures.json');
const fixtures = JSON.parse(readFileSync(fixturesPath, 'utf8')) as Fixtures;

const DEMO_EMAIL = 'marcus.vance@example.com';
const DEMO_PASSWORD = 'teedeux1234';

async function seedCatalog(): Promise<void> {
  // Firestore batches cap at 500 writes; this catalog is far below that, but
  // chunking keeps the script honest if the fixtures grow.
  const CHUNK = 400;

  const writeAll = async <T>(
    items: T[],
    collection: string,
    idOf: (item: T) => string,
    dataOf: (item: T) => Record<string, unknown>
  ) => {
    for (let i = 0; i < items.length; i += CHUNK) {
      const batch = db.batch();
      for (const item of items.slice(i, i + CHUNK)) {
        batch.set(db.collection(collection).doc(idOf(item)), dataOf(item), { merge: true });
      }
      await batch.commit();
    }
  };

  await writeAll(
    fixtures.stores,
    COLLECTIONS.stores,
    (store) => store.id,
    (store) => ({
      name: store.name,
      rating: store.rating,
      deliveryTime: store.deliveryTime,
      deliveryFee: store.deliveryFee,
      minOrder: store.minOrder,
      tagline: store.tagline,
      imageUrl: store.imageUrl,
      isFeatured: Boolean(store.isFeatured),
      categoryTags: store.categoryTags ?? [],
    })
  );

  await writeAll(
    fixtures.products,
    COLLECTIONS.products,
    (product) => product.id,
    (product) => ({
      name: product.name,
      category: product.category,
      price: product.price,
      currency: product.currency,
      weightOrUnit: product.weightOrUnit,
      imageUrl: product.imageUrl,
      isNewArrival: Boolean(product.isNewArrival),
      storeId: product.storeId,
      storeName: product.storeName,
      description: product.description ?? null,
      // Derived here so search never depends on a client computing it.
      searchTokens: buildSearchTokens(
        product.name,
        product.description,
        product.storeName,
        product.category
      ),
    })
  );

  await writeAll(
    fixtures.aisles,
    COLLECTIONS.aisles,
    (aisle) => aisle.id,
    (aisle) => ({
      label: aisle.label,
      icon: aisle.icon,
      tint: aisle.tint,
      position: fixtures.aisles.findIndex((a) => a.id === aisle.id),
    })
  );

  console.log(
    `seeded ${fixtures.stores.length} hubs, ${fixtures.products.length} products, ` +
      `${fixtures.aisles.length} aisles`
  );
}

async function seedDemoUser(): Promise<void> {
  let uid: string;

  try {
    const existing = await auth.getUserByEmail(DEMO_EMAIL);
    uid = existing.uid;
    console.log(`demo user already present: ${DEMO_EMAIL}`);
  } catch {
    const created = await auth.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      displayName: 'Marcus Vance',
    });
    uid = created.uid;
    console.log(`demo user created: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }

  await db
    .collection(COLLECTIONS.users)
    .doc(uid)
    .set(
      {
        name: 'Marcus Vance',
        email: DEMO_EMAIL,
        phone: '+1 (713) 555-0199',
        avatarUrl: null,
        isPlusMember: true,
        walletBalance: 1240.5,
        loyaltyPoints: 320,
        defaultAddress: '1234 Westheimer Rd, Houston, TX 77006',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

  // One delivered order so "buy it again" has history to draw on. Skipped if
  // the account already has orders, to keep re-runs idempotent.
  const existingOrders = await db
    .collection(COLLECTIONS.orders)
    .where('userId', '==', uid)
    .limit(1)
    .get();

  if (!existingOrders.empty) return;

  const now = new Date().toISOString();
  const history = fixtures.products.slice(0, 6);
  const byStore = new Map<string, Product[]>();

  for (const product of history) {
    const bucket = byStore.get(product.storeId);
    if (bucket) bucket.push(product);
    else byStore.set(product.storeId, [product]);
  }

  const batch = db.batch();
  for (const [storeId, items] of byStore) {
    const store = fixtures.stores.find((s) => s.id === storeId);
    const subtotal = Math.round(items.reduce((sum, p) => sum + p.price, 0) * 100) / 100;

    batch.set(db.collection(COLLECTIONS.orders).doc(), {
      userId: uid,
      storeId,
      storeName: store?.name ?? items[0]?.storeName ?? '',
      storeImageUrl: store?.imageUrl ?? '',
      status: 'delivered',
      subtotal,
      deliveryFee: 0,
      serviceFee: 1.5,
      discount: 0,
      total: Math.round((subtotal + 1.5) * 100) / 100,
      deliveryAddress: '1234 Westheimer Rd, Houston, TX 77006',
      placedAt: now,
      updatedAt: now,
      items: items.map((product) => ({
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        weightOrUnit: product.weightOrUnit,
        unitPrice: product.price,
        quantity: 1,
      })),
    });
  }
  await batch.commit();

  console.log(`seeded ${byStore.size} historical orders`);
}

await seedCatalog();
await seedDemoUser();
console.log('done');
