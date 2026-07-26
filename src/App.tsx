import React, { useEffect, useRef, useState } from 'react';
import { Product, ProductCategory, ScreenId, Store, UserProfile } from './types';
import { mockProducts, mockStores, mockUserProfile } from './data/mockData';
import { useCart } from './hooks/useCart';
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
import { DemoNavigator } from './components/DemoNavigator';

/** Screens reachable from a tab — landing on one shouldn't offer a back arrow. */
const ROOT_SCREENS: ScreenId[] = ['home', 'stores', 'buy-it-again', 'cart', 'profile'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [history, setHistory] = useState<ScreenId[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store>(mockStores[0]);
  const [selectedAisle, setSelectedAisle] = useState<ProductCategory | 'all'>('all');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState(
    '1234 Westheimer Rd, Houston, TX 77006'
  );
  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);

  const cart = useCart(
    [
      { product: mockProducts[0], quantity: 2 },
      { product: mockProducts[3], quantity: 1 },
    ],
    mockStores
  );

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
    const store = mockStores.find((s) => s.id === product.storeId) ?? mockStores[0];
    setActiveProduct(null);
    setSelectedStore(store);
    navigate('store-detail');
  };

  const handleTopUpWallet = (amount: number) => {
    setUserProfile((prev) => ({ ...prev, walletBalance: prev.walletBalance + amount }));
  };

  const browseAisle = (aisle: ProductCategory | 'all') => setSelectedAisle(aisle);

  const catalogProps = {
    onOpenProduct: openProduct,
    quantityOf: cart.quantityOf,
    onIncrement: cart.addItem,
    onDecrement: cart.decrementItem,
  };

  const showBack = !ROOT_SCREENS.includes(currentScreen) && history.length > 0;

  return (
    /* Phone shell: full-bleed on a handset, centred device frame on a desktop browser. */
    <div className="min-h-screen bg-stone-300/60 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#fcf9f8] text-[#1c1b1b] flex flex-col relative shadow-2xl font-['Hanken_Grotesk'] selection:bg-[#9c3f00] selection:text-white">
        <DemoNavigator currentScreen={currentScreen} onNavigate={navigate} />

        <Header
          currentScreen={currentScreen}
          onNavigate={navigate}
          address={deliveryAddress}
          titleOverride={currentScreen === 'store-detail' ? selectedStore.name : undefined}
          showBack={showBack}
          onBack={goBack}
          onAddToCart={cart.addItem}
          onSelectStore={setSelectedStore}
        />

        <main className="flex-1 overflow-x-hidden">
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
              onSelectAddress={setDeliveryAddress}
              currentAddress={deliveryAddress}
            />
          )}

          {currentScreen === 'login' && <LoginScreen onNavigate={navigate} />}
          {currentScreen === 'signup' && <SignupScreen onNavigate={navigate} />}
          {currentScreen === 'reset-password' && <ResetPasswordScreen onNavigate={navigate} />}

          {currentScreen === 'home' && (
            <HomeScreen
              onNavigate={navigate}
              onSelectStore={setSelectedStore}
              onSelectAisle={browseAisle}
              {...catalogProps}
            />
          )}

          {currentScreen === 'stores' && (
            <StoresScreen
              onNavigate={navigate}
              onSelectStore={setSelectedStore}
              selectedAisle={selectedAisle}
              onSelectAisle={browseAisle}
              {...catalogProps}
            />
          )}

          {currentScreen === 'store-detail' && (
            <StoreDetailScreen
              store={selectedStore}
              onNavigate={navigate}
              {...catalogProps}
            />
          )}

          {currentScreen === 'buy-it-again' && (
            <BuyItAgainScreen onNavigate={navigate} {...catalogProps} />
          )}

          {currentScreen === 'cart' && (
            <CartScreen
              storeCarts={cart.storeCarts}
              subtotal={cart.subtotal}
              onSetQuantity={cart.setQuantity}
              onClearStore={cart.clearStore}
              onNavigate={navigate}
            />
          )}

          {currentScreen === 'order-tracking' && <OrderTrackingScreen onNavigate={navigate} />}
          {currentScreen === 'transactions' && <TransactionsScreen onNavigate={navigate} />}

          {currentScreen === 'profile' && (
            <ProfileScreen
              user={userProfile}
              onNavigate={navigate}
              onSignOut={() => navigate('login')}
            />
          )}

          {currentScreen === 'payment' && (
            <PaymentMethodsScreen
              onNavigate={navigate}
              walletBalance={userProfile.walletBalance}
              loyaltyPoints={userProfile.loyaltyPoints}
              onTopUpWallet={handleTopUpWallet}
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

        <Navbar
          currentScreen={currentScreen}
          onNavigate={navigate}
          cartCount={cart.totalCount}
        />
      </div>
    </div>
  );
}
