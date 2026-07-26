import React from 'react';
import { Aisle, Product, ProductCategory, ScreenId, Store } from '../types';
import { ProductTile } from './ui/ProductTile';
import { RetailerCard } from './ui/RetailerCard';
import { SectionRail } from './ui/SectionRail';

interface HomeScreenProps {
  stores: Store[];
  products: Product[];
  aisles: Aisle[];
  buyItAgain: Product[];
  onNavigate: (screen: ScreenId) => void;
  onSelectStore: (store: Store) => void;
  onSelectAisle: (aisle: ProductCategory) => void;
  onOpenProduct: (product: Product) => void;
  quantityOf: (productId: string) => number;
  onIncrement: (product: Product) => void;
  onDecrement: (product: Product) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stores,
  products,
  aisles,
  buyItAgain,
  onNavigate,
  onSelectStore,
  onSelectAisle,
  onOpenProduct,
  quantityOf,
  onIncrement,
  onDecrement,
}) => {
  const handleStoreSelect = (store: Store) => {
    onSelectStore(store);
    onNavigate('store-detail');
  };

  const handleAisleSelect = (aisle: Aisle) => {
    onSelectAisle(aisle.id);
    onNavigate('stores');
  };

  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 10);
  const underTwenty = products.filter((p) => p.price < 20).slice(0, 10);

  const tileProps = {
    onIncrement,
    onDecrement,
    onOpen: onOpenProduct,
  };

  return (
    <div className="pb-6 space-y-7">
      {/* Free-delivery promo strip */}
      <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-[#9c3f00] to-[#c45100] text-white px-4 py-3 flex items-center gap-3">
        <span className="material-symbols-outlined text-2xl shrink-0">local_shipping</span>
        <div className="min-w-0">
          <p className="font-extrabold text-sm leading-tight">Free delivery on $35+</p>
          <p className="text-[11px] text-white/85 leading-tight mt-0.5">
            Nationwide 2-day express to all 50 states
          </p>
        </div>
      </div>

      {/* Retailer carousel — pick where to shop */}
      {stores.length > 0 && (
        <SectionRail
          title="Shop by hub"
          subtitle="Verified African grocery fulfilment hubs"
          onSeeAll={() => onNavigate('stores')}
        >
          {stores.map((store) => (
            <RetailerCard key={store.id} store={store} onSelect={handleStoreSelect} />
          ))}
        </SectionRail>
      )}

      {/* Buy it again — highest-intent row for a returning shopper */}
      {buyItAgain.length > 0 && (
        <SectionRail
          title="Buy it again"
          subtitle="Straight from your past orders"
          onSeeAll={() => onNavigate('buy-it-again')}
        >
          {buyItAgain.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              layout="rail"
              quantity={quantityOf(product.id)}
              {...tileProps}
            />
          ))}
        </SectionRail>
      )}

      {/* Aisle grid */}
      {aisles.length > 0 && (
        <section className="space-y-3">
          <div className="px-4">
            <h2 className="text-lg font-extrabold text-[#1c1b1b]">Shop by aisle</h2>
            <p className="text-xs text-[#584238] mt-0.5">Browse the full catalog by department</p>
          </div>

          <div className="grid grid-cols-3 gap-3 px-4">
            {aisles.map((aisle) => (
              <button
                key={aisle.id}
                type="button"
                onClick={() => handleAisleSelect(aisle)}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <div
                  className={`${aisle.tint} h-16 w-16 rounded-full flex items-center justify-center`}
                >
                  <span className="material-symbols-outlined text-[28px] text-[#584238]">
                    {aisle.icon}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#1c1b1b] text-center leading-tight">
                  {aisle.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Curated rows */}
      {newArrivals.length > 0 && (
        <SectionRail
          title="New arrivals"
          subtitle="Just landed in the catalog"
          onSeeAll={() => onNavigate('stores')}
        >
          {newArrivals.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              layout="rail"
              quantity={quantityOf(product.id)}
              {...tileProps}
            />
          ))}
        </SectionRail>
      )}

      {underTwenty.length > 0 && (
        <SectionRail
          title="Pantry staples under $20"
          subtitle="Everyday essentials, everyday prices"
          onSeeAll={() => onNavigate('stores')}
        >
          {underTwenty.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              layout="rail"
              quantity={quantityOf(product.id)}
              {...tileProps}
            />
          ))}
        </SectionRail>
      )}

      {/* All hubs, as rows */}
      {stores.length > 0 && (
        <section className="space-y-3">
          <div className="px-4">
            <h2 className="text-lg font-extrabold text-[#1c1b1b]">All fulfilment hubs</h2>
          </div>
          <div className="px-4 space-y-2.5">
            {stores.map((store) => (
              <RetailerCard
                key={store.id}
                store={store}
                layout="row"
                onSelect={handleStoreSelect}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
