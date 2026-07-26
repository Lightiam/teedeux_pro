/**
 * End-to-end API checks against a running server.
 *
 *   npm start          # in one terminal
 *   npm test           # in another
 *
 * Every run creates fresh accounts, so it is safe to repeat against the same
 * database. Set API_URL to point at a different host.
 */
const BASE = process.env.API_URL ?? 'http://localhost:4000/api';
let pass = 0;
let fail = 0;

function check(name, condition, detail = '') {
  if (condition) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? ` -- ${detail}` : ''}`);
  }
}

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
    /* empty body */
  }
  return { status: res.status, body: json };
}

console.log('\n== catalog (public) ==');
const stores = await call('GET', '/catalog/stores');
check('GET /catalog/stores -> 200', stores.status === 200, `got ${stores.status}`);
check('returns 4 hubs', stores.body?.stores?.length === 4, `got ${stores.body?.stores?.length}`);

const aisles = await call('GET', '/catalog/aisles');
check('GET /catalog/aisles -> 6', aisles.body?.aisles?.length === 6);

const allProducts = await call('GET', '/catalog/products?limit=200');
check('GET /catalog/products -> 29', allProducts.body?.total === 29, `got ${allProducts.body?.total}`);

const produce = await call('GET', '/catalog/products?category=produce');
check(
  'category filter returns only produce',
  produce.body?.products?.length > 0 &&
    produce.body.products.every((p) => p.category === 'produce'),
  `n=${produce.body?.products?.length}`
);

const searched = await call('GET', '/catalog/products?search=teff');
check(
  'search=teff matches',
  searched.body?.products?.some((p) => /teff/i.test(p.name)),
  JSON.stringify(searched.body?.products?.map((p) => p.name))
);

const badCategory = await call('GET', '/catalog/products?category=nope');
check('invalid category -> 400', badCategory.status === 400, `got ${badCategory.status}`);

const missingProduct = await call('GET', '/catalog/products/does-not-exist');
check('unknown product -> 404', missingProduct.status === 404);

console.log('\n== auth ==');
const email = `tester_${Date.now()}@example.com`;

const shortPw = await call('POST', '/auth/signup', {
  body: { name: 'Test Shopper', email, password: 'short' },
});
check('signup with short password -> 400', shortPw.status === 400, `got ${shortPw.status}`);

const signup = await call('POST', '/auth/signup', {
  body: { name: 'Test Shopper', email, password: 'correct-horse-battery' },
});
check('signup -> 201', signup.status === 201, JSON.stringify(signup.body));
check('signup returns token', typeof signup.body?.token === 'string');
check('signup does not leak password_hash', !JSON.stringify(signup.body).includes('password_hash'));

const dupe = await call('POST', '/auth/signup', {
  body: { name: 'Someone Else', email, password: 'correct-horse-battery' },
});
check('duplicate email -> 409', dupe.status === 409, `got ${dupe.status}`);

const badLogin = await call('POST', '/auth/login', {
  body: { email, password: 'wrong-password' },
});
check('wrong password -> 401', badLogin.status === 401);

const login = await call('POST', '/auth/login', {
  body: { email, password: 'correct-horse-battery' },
});
check('login -> 200', login.status === 200);
const token = login.body?.token;
check('login returns token', typeof token === 'string');

const noAuth = await call('GET', '/cart');
check('cart without token -> 401', noAuth.status === 401);

const badToken = await call('GET', '/cart', { token: 'garbage.token.here' });
check('cart with bad token -> 401', badToken.status === 401);

console.log('\n== cart ==');
const products = allProducts.body.products;
const suya = products.find((p) => p.name.includes('Suya Kebab'));
const teff = products.find((p) => p.name.includes('Teff Flour'));
check('fixtures resolved', Boolean(suya && teff));
check('suya and teff are different hubs', suya.storeId !== teff.storeId);

const empty = await call('GET', '/cart', { token });
check('new cart is empty', empty.body?.itemCount === 0 && empty.body?.carts?.length === 0);

await call('POST', '/cart/items', { token, body: { productId: suya.id, quantity: 2 } });
const added = await call('POST', '/cart/items', { token, body: { productId: teff.id, quantity: 1 } });
check('cart has 3 items', added.body?.itemCount === 3, `got ${added.body?.itemCount}`);
check('cart split across 2 hubs', added.body?.carts?.length === 2, `got ${added.body?.carts?.length}`);

const expectedSubtotal = Math.round((suya.price * 2 + teff.price) * 100) / 100;
check(
  `subtotal = ${expectedSubtotal}`,
  added.body?.totals?.subtotal === expectedSubtotal,
  `got ${added.body?.totals?.subtotal}`
);
check('free delivery over $35', added.body?.totals?.deliveryFee === 0);
check(
  'total = subtotal + service fee',
  added.body?.totals?.total === Math.round((expectedSubtotal + 1.5) * 100) / 100,
  `got ${added.body?.totals?.total}`
);

const addAgain = await call('POST', '/cart/items', { token, body: { productId: suya.id, quantity: 1 } });
check('re-adding accumulates', addAgain.body?.itemCount === 4, `got ${addAgain.body?.itemCount}`);

const setQty = await call('PATCH', `/cart/items/${suya.id}`, { token, body: { quantity: 2 } });
check('PATCH sets absolute quantity', setQty.body?.itemCount === 3, `got ${setQty.body?.itemCount}`);

const promo = await call('GET', '/cart?promoCode=FRESH', { token });
check('FRESH promo discounts $5', promo.body?.totals?.discount === 5, `got ${promo.body?.totals?.discount}`);
check('promo marked valid', promo.body?.promoValid === true);

const badPromo = await call('GET', '/cart?promoCode=NOPE', { token });
check('unknown promo gives no discount', badPromo.body?.totals?.discount === 0);
check('unknown promo marked invalid', badPromo.body?.promoValid === false);

const missingAdd = await call('POST', '/cart/items', { token, body: { productId: 'nope', quantity: 1 } });
check('adding unknown product -> 404', missingAdd.status === 404);

const zeroQty = await call('PATCH', `/cart/items/${teff.id}`, { token, body: { quantity: 0 } });
check('quantity 0 removes the line', zeroQty.body?.carts?.length === 1, `got ${zeroQty.body?.carts?.length}`);

console.log('\n== checkout ==');
await call('POST', '/cart/items', { token, body: { productId: teff.id, quantity: 1 } });

const noAddress = await call('POST', '/orders/checkout', { token, body: {} });
check('checkout without address -> 400', noAddress.status === 400, `got ${noAddress.status}`);

const checkout = await call('POST', '/orders/checkout', {
  token,
  body: { deliveryAddress: '500 Main St, Houston, TX 77002' },
});
check('checkout -> 201', checkout.status === 201, JSON.stringify(checkout.body)?.slice(0, 200));
check('one order per hub', checkout.body?.orders?.length === 2, `got ${checkout.body?.orders?.length}`);

const emptied = await call('GET', '/cart', { token });
check('cart emptied after checkout', emptied.body?.itemCount === 0, `got ${emptied.body?.itemCount}`);

const secondCheckout = await call('POST', '/orders/checkout', {
  token,
  body: { deliveryAddress: '500 Main St, Houston, TX 77002' },
});
check('checkout with empty cart -> 400', secondCheckout.status === 400);

const orderId = checkout.body.orders[0].id;
const orderTotal = checkout.body.orders[0].total;

console.log('\n== orders ==');
const list = await call('GET', '/orders', { token });
check('order list has 2', list.body?.orders?.length === 2, `got ${list.body?.orders?.length}`);
check('orders carry line items', list.body?.orders?.[0]?.items?.length > 0);
check('order status starts placed', list.body?.orders?.every((o) => o.status === 'placed'));

const one = await call('GET', `/orders/${orderId}`, { token });
check('GET single order -> 200', one.status === 200);

const advance = await call('POST', `/orders/${orderId}/status`, { token, body: { status: 'shopping' } });
check('advance to shopping -> 200', advance.status === 200);
check('status updated', advance.body?.order?.status === 'shopping');

const backwards = await call('POST', `/orders/${orderId}/status`, { token, body: { status: 'placed' } });
check('cannot move status backwards -> 409', backwards.status === 409, `got ${backwards.status}`);

await call('POST', `/orders/${orderId}/status`, { token, body: { status: 'packed' } });
await call('POST', `/orders/${orderId}/status`, { token, body: { status: 'in_transit' } });
const delivered = await call('POST', `/orders/${orderId}/status`, { token, body: { status: 'delivered' } });
check('reaches delivered', delivered.body?.order?.status === 'delivered');

const afterFinal = await call('POST', `/orders/${orderId}/status`, { token, body: { status: 'cancelled' } });
check('delivered order is final -> 409', afterFinal.status === 409, `got ${afterFinal.status}`);

console.log('\n== ownership isolation ==');
const other = await call('POST', '/auth/signup', {
  body: { name: 'Other Shopper', email: `other_${Date.now()}@example.com`, password: 'another-long-password' },
});
const otherToken = other.body.token;

const peek = await call('GET', `/orders/${orderId}`, { token: otherToken });
check("cannot read another user's order -> 404", peek.status === 404, `got ${peek.status}`);

const tamper = await call('POST', `/orders/${orderId}/status`, {
  token: otherToken,
  body: { status: 'cancelled' },
});
check("cannot mutate another user's order -> 404", tamper.status === 404, `got ${tamper.status}`);

const otherCart = await call('GET', '/cart', { token: otherToken });
check('new user has an empty cart', otherCart.body?.itemCount === 0);

console.log('\n== buy it again ==');
const anon = await call('GET', '/catalog/buy-it-again');
check('anonymous buy-it-again -> empty, not 401', anon.status === 200 && anon.body?.products?.length === 0);

const mine = await call('GET', '/catalog/buy-it-again', { token });
check('buy-it-again reflects order history', mine.body?.products?.length > 0, `got ${mine.body?.products?.length}`);

console.log('\n== profile ==');
const me = await call('GET', '/profile', { token });
check('GET /profile -> 200', me.status === 200);
check('loyalty points earned at checkout', me.body?.user?.loyaltyPoints > 0, `got ${me.body?.user?.loyaltyPoints}`);

const patched = await call('PATCH', '/profile', { token, body: { name: 'Renamed Shopper' } });
check('PATCH /profile updates name', patched.body?.user?.name === 'Renamed Shopper');

const emptyPatch = await call('PATCH', '/profile', { token, body: {} });
check('empty PATCH -> 400', emptyPatch.status === 400, `got ${emptyPatch.status}`);

const topUp = await call('POST', '/profile/wallet/top-up', { token, body: { amount: 25 } });
check('wallet top-up credits balance', topUp.body?.user?.walletBalance === 25, `got ${topUp.body?.user?.walletBalance}`);

const negative = await call('POST', '/profile/wallet/top-up', { token, body: { amount: -50 } });
check('negative top-up -> 400', negative.status === 400, `got ${negative.status}`);

console.log('\n== misc ==');
const missing = await call('GET', '/no-such-route');
check('unknown route -> 404', missing.status === 404);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
