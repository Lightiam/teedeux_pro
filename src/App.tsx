import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Product, ProductCategory, ScreenId, Store } from './types';
import type { ApiOrder, ApiOrderStatus } from './api/types';
import { orderApi } from './api/endpoints';
import { ApiError } from './api/client';
import { useAuth } from './context/AuthContext';
import { isFirebaseConfigured } from './auth/firebase';
import { useBuyItAgain, useCatalog } from './hooks/useCatalog';
import { useServerCart } from './hooks/useServerCart';
import { useFirestoreCart } from './hooks/useFirestoreCart';
import { firestoreOrders, isPendingPricing } from './firestore/orders';
import { registerHardwareBack } from './native';

import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingDiscoverScreen } from './components/OnboardingDiscoverScreen';
import { OnboardingScheduleScreen } from './components/OnboardingScheduleScreen';
import { LocationSelectorScreen } from './components/LocationSelectorScreen';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { HomeScreen } from './components/HomeScreen';
import { StoresScreen } from './components/StoresScreen';
import { StoreDetailScreen } from './components/StoreDetailScreen';
import { BuyItAgainScreen } from './components/BuyItAgainScreen';
import { CartScreen } from './components/CartScreen';
import { OrderTrackingScreen } from './components/OrderTrackingScreen';
import { TransactionsScreen } from './components/TransactionsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { PaymentMethodsScreen } from './components/PaymentMethodsScreen';
import { ProductSheet } from './components/ProductSheet';

/** Screens reachable from a tab — landing on one shouldn't offer a back arrow. */
const ROOT_SCREENS: ScreenId[] = ['home', 'stores', 'buy-it-again', 'cart', 'profile'];

/** Phone shell: full-bleed on a handset, centred device frame on desktop. */
const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-stone-300/60 flex justify-center">
    <div className="w-full max-w-[430px] min-h-screen bg-[#fcf9f8] text-[#1c1b1b] flex flex-col relative shadow-2xl font-['Hanken_Grotesk'] selection:bg-[#9c3f00] selection:text-white">
      {children}
    </div>
  </div>
);

export default function App() {
  const auth = useAuth();

  if (auth.isLoading) return <BootScreen />;
  if (!auth.isAuthenticated) return <AuthFlow />;
  return <Shop />;
}

/** Shown while a stored token is validated, so the app never flashes the login screen. */
const BootScreen: React.FC = () => (
  <Shell>
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <div className="h-16 w-16 rounded-2xl bg-[#9c3f00] text-white flex items-center justify-center font-extrabold text-3xl">
        T
      </div>
      <span className="h-5 w-5 rounded-full border-2 border-[#9c3f00]/30 border-t-[#9c3f00] animate-spin" />
    </div>
  </Shell>
);

/** Sign-in, sign-up and reset. The shop is unreachable until one succeeds. */
const AuthFlow: React.FC = () => {
  const [screen, setScreen] = useState<ScreenId>('login');

  return (
    <Shell>
      <div className="flex-1 flex flex-col">
        {screen === 'signup' ? (
          <SignupScreen onNavigate={setScreen} />
        ) : screen === 'reset-password' ? (
          <ResetPasswordScreen onNavigate={setScreen} />
        ) : (
          <LoginScreen onNavigate={setScreen} />
        )}
      </div>
    </Shell>
  );
};

function Shop() {
  const { user, logout, setUser } = useAuth();
  const catalog = useCatalog();
  const buyItAgain = useBuyItAgain(true);

  // Both hooks are called unconditionally — React requires a stable hook order —
  // and only the one matching the deployment is given work to do.
  const apiCart = useServerCart(!isFirebaseConfigured);
  const firestoreCartState = useFirestoreCart(
    isFirebaseConfigured ? (user?.id ?? null) : null,
    catalog.products,
    catalog.stores
  );
  const cart = isFirebaseConfigured ? firestoreCartState : apiCart;

  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [history, setHistory] = useState<ScreenId[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedAisle, setSelectedAisle] = useState<ProductCategory | 'all'>('all');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);

  const address = user?.defaultAddress ?? 'Set a delivery address';

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      // On Firebase, orders are read straight from Firestore and their display
      // detail rebuilt from the catalog — the order document holds only item
      // ids and quantities.
      const loaded =
        isFirebaseConfigured && user
          ? await firestoreOrders.list(user.id, catalog.products, catalog.stores)
          : (await orderApi.list()).orders;

      setOrders(loaded);
      setOrdersError(null);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : 'Could not load your orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [user, catalog.products, catalog.stores]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  /**
   * Push the outgoing screen onto history so the back arrow can unwind it.
   * Landing on a tab root clears the stack — tabs are entry points, not steps.
   */
  const navigate = (screen: ScreenId) => {
    if (screen === currentScreen) return;
    setHistory((h) => (ROOT_SCREENS.includes(screen) ? [] : [...h, currentScreen]));
    setCurrentScreen(screen);
  };

  /**
   * The Android back listener is registered once, so anything it calls must
   * read live state rather than the values captured on first render.
   */
  const backState = useRef({ history, activeProduct });
  backState.current = { history, activeProduct };

  const goBack = () => {
    const stack = backState.current.history;
    setCurrentScreen(stack[stack.length - 1] ?? 'home');
    setHistory((h) => h.slice(0, -1));
  };

  useEffect(
    () =>
      registerHardwareBack(() => {
        // A sheet is the topmost layer — close it before unwinding navigation.
        if (backState.current.activeProduct) {
          setActiveProduct(null);
          return true;
        }
        if (backState.current.history.length > 0) {
          goBack();
          return true;
        }
        // Nothing left to pop: let the shell exit the app.
        return false;
      }),
    // Registered once for the app's lifetime; live state comes from backState.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const openProduct = (product: Product) => setActiveProduct(product);

  const viewProductStore = (product: Product) => {
    const store = catalog.stores.find((s) => s.id === product.storeId);
    if (!store) return;
    setActiveProduct(null);
    setSelectedStore(store);
    navigate('store-detail');
  };

  const handleCheckout = async () => {
    if (isFirebaseConfigured && user) {
      // Writes one order per hub carrying item ids and quantities only. The
      // rules reject any price or total, so the figure shown in the cart is an
      // estimate until a server prices the order.
      try {
        await firestoreOrders.placeOrders(user.id, cart.storeCarts, user.defaultAddress);
      } catch (error) {
        // The order-create rule is newer than the rest; a project still on the
        // previous ruleset rejects the write outright.
        if ((error as { code?: string })?.code === 'permission-denied') {
          throw new Error(
            'Checkout is not enabled yet — the updated Firestore rules have not been ' +
              'published. Your cart is saved and will still be here.'
          );
        }
        throw error;
      }
    } else {
      try {
        await orderApi.checkout({ deliveryAddress: user?.defaultAddress ?? undefined });
      } catch (error) {
        if (error instanceof ApiError && error.code === 'api_unreachable') {
          throw new Error(
            'Checkout is not available yet — the order service has not been deployed. ' +
              'Your cart is saved and will still be here.'
          );
        }
        throw error;
      }
    }

    await Promise.all([cart.refresh(), loadOrders()]);
    setTrackedOrderId(null);
    navigate('order-tracking');
  };

  const advanceOrder = async (orderId: string, status: ApiOrderStatus) => {
    const { order } = await orderApi.setStatus(orderId, status);
    setOrders((current) => current.map((o) => (o.id === order.id ? order : o)));
  };

  const trackedOrder =
    orders.find((order) => order.id === trackedOrderId) ??
    // Default to the newest order that hasn't finished yet, then the newest overall.
    orders.find((order) => order.status !== 'delivered' && order.status !== 'cancelled') ??
    orders[0] ??
    null;

  const catalogProps = {
    onOpenProduct: openProduct,
    quantityOf: cart.quantityOf,
    onIncrement: cart.addItem,
    onDecrement: cart.decrementItem,
  };

  const showBack = !ROOT_SCREENS.includes(currentScreen) && history.length > 0;

  return (
    <Shell>
      <Header
        currentScreen={currentScreen}
        onNavigate={navigate}
        products={catalog.products}
        stores={catalog.stores}
        address={address}
        titleOverride={
          currentScreen === 'store-detail' ? (selectedStore?.name ?? 'Hub') : undefined
        }
        showBack={showBack}
        onBack={goBack}
        onAddToCart={cart.addItem}
        onSelectStore={setSelectedStore}
      />

      <main className="flex-1 overflow-x-hidden">
        {catalog.error && currentScreen === 'home' && (
          <div className="mx-4 mt-3 rounded-2xl bg-[#ffdad6] text-[#93000a] px-4 py-3 text-xs font-semibold">
            {catalog.error}{' '}
            <button type="button" onClick={catalog.reload} className="underline font-bold">
              Retry
            </button>
          </div>
        )}

        {currentScreen === 'splash' && <SplashScreen onNavigate={navigate} />}

        {currentScreen === 'onboarding-discover' && (
          <OnboardingDiscoverScreen onNavigate={navigate} />
        )}

        {currentScreen === 'onboarding-schedule' && (
          <OnboardingScheduleScreen onNavigate={navigate} />
        )}

        {currentScreen === 'location' && (
          <LocationSelectorScreen
            onNavigate={navigate}
            onSelectAddress={(next) => {
              // Persist to the profile so checkout and the header agree.
              if (user) setUser({ ...user, defaultAddress: next });
            }}
            currentAddress={address}
          />
        )}

        {currentScreen === 'home' &&
          (catalog.isLoading ? (
            <CatalogSkeleton />
          ) : (
            <HomeScreen
              stores={catalog.stores}
              products={catalog.products}
              aisles={catalog.aisles}
              buyItAgain={buyItAgain.products}
              onNavigate={navigate}
              onSelectStore={setSelectedStore}
              onSelectAisle={setSelectedAisle}
              {...catalogProps}
            />
          ))}

        {currentScreen === 'stores' &&
          (catalog.isLoading ? (
            <CatalogSkeleton />
          ) : (
            <StoresScreen
              stores={catalog.stores}
              products={catalog.products}
              aisles={catalog.aisles}
              onNavigate={navigate}
              onSelectStore={setSelectedStore}
              selectedAisle={selectedAisle}
              onSelectAisle={setSelectedAisle}
              {...catalogProps}
            />
          ))}

        {currentScreen === 'store-detail' &&
          (selectedStore ? (
            <StoreDetailScreen
              store={selectedStore}
              products={catalog.products}
              aisles={catalog.aisles}
              onNavigate={navigate}
              {...catalogProps}
            />
          ) : (
            <CatalogSkeleton />
          ))}

        {currentScreen === 'buy-it-again' && (
          <BuyItAgainScreen
            products={buyItAgain.products}
            isLoading={buyItAgain.isLoading}
            onNavigate={navigate}
            {...catalogProps}
          />
        )}

        {currentScreen === 'cart' && (
          <CartScreen
            storeCarts={cart.storeCarts}
            totals={cart.totals}
            promoValid={cart.promoValid}
            isLoading={cart.isLoading}
            error={cart.error}
            onSetQuantity={cart.setQuantity}
            onClearStore={cart.clearStore}
            onApplyPromo={cart.applyPromo}
            onCheckout={handleCheckout}
            onNavigate={navigate}
          />
        )}

        {currentScreen === 'order-tracking' && (
          <OrderTrackingScreen
            order={trackedOrder}
            isLoading={ordersLoading}
            onNavigate={navigate}
            onAdvance={advanceOrder}
            // Status transitions and pricing are both server-written; the rules
            // keep clients out of them.
            canAdvance={!isFirebaseConfigured}
            pricingPending={
              isFirebaseConfigured && trackedOrder !== null && isPendingPricing(trackedOrder)
            }
          />
        )}

        {currentScreen === 'transactions' && (
          <TransactionsScreen
            orders={orders}
            isLoading={ordersLoading}
            error={ordersError}
            onNavigate={navigate}
            onSelectOrder={(order) => {
              setTrackedOrderId(order.id);
              navigate('order-tracking');
            }}
          />
        )}

        {currentScreen === 'profile' && user && (
          <ProfileScreen
            user={user}
            onNavigate={navigate}
            onSignOut={logout}
            onUserUpdated={setUser}
          />
        )}

        {currentScreen === 'payment' && user && (
          <PaymentMethodsScreen
            onNavigate={navigate}
            walletBalance={user.walletBalance}
            loyaltyPoints={user.loyaltyPoints}
            onUserUpdated={setUser}
          />
        )}
      </main>

      <ProductSheet
        product={activeProduct}
        quantity={activeProduct ? cart.quantityOf(activeProduct.id) : 0}
        onClose={() => setActiveProduct(null)}
        onIncrement={cart.addItem}
        onDecrement={cart.decrementItem}
        onViewStore={viewProductStore}
      />

      <Navbar currentScreen={currentScreen} onNavigate={navigate} cartCount={cart.totalCount} />
    </Shell>
  );
}

/** Placeholder tiles shown while the catalog request is in flight. */
const CatalogSkeleton: React.FC = () => (
  <div className="px-4 pt-4 space-y-5">
    <div className="h-16 rounded-2xl bg-stone-200/70 animate-pulse" />
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-32 w-[10.5rem] shrink-0 rounded-2xl bg-stone-200/70 animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-x-3 gap-y-5">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i}>
          <div className="aspect-square w-full rounded-2xl bg-stone-200/70 animate-pulse mb-2" />
          <div className="h-3.5 w-1/3 rounded bg-stone-200/70 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);
