import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext.js';
import { CartProvider } from './context/CartContext.js';
import { TopBanner } from './components/TopBanner.js';
import { Navbar } from './components/Navbar.js';
import { Hero } from './components/Hero.js';
import { FeaturedSections } from './components/FeaturedSections.js';
import { ProductCatalog } from './components/ProductCatalog.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { CheckoutModal } from './components/CheckoutModal.js';
import { AboutSection } from './components/AboutSection.js';
import { Footer } from './components/Footer.js';
import { AdminDashboard } from './components/Admin/AdminDashboard.js';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { products, selectedProduct, setSelectedProduct, isLoading } = useStore();

  const handleShopNow = () => {
    setActiveTab('shop');
    const catalog = document.getElementById('catalog-section');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0b0d] text-[#e8e8e3] grain-overlay">
      {/* 1. Slim Announcement Bar */}
      <TopBanner />

      {/* 2. Top Navigation Bar (Follows Top Bar Contract) */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 3. Page Content */}
      <main className="flex-1">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-[#f4f4f0] border-t-transparent animate-spin rounded-full" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#888894]">
              LOADING GALUR ARCHIVE...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <>
                <Hero onShopClick={handleShopNow} />
                <FeaturedSections products={products} onExploreAll={() => setActiveTab('shop')} />
                <ProductCatalog products={products} />
                <AboutSection />
              </>
            )}

            {(activeTab === 'shop' || activeTab === 'collections') && (
              <div className="pt-6">
                <ProductCatalog products={products} />
              </div>
            )}

            {activeTab === 'about' && (
              <div className="pt-6">
                <AboutSection />
              </div>
            )}
          </>
        )}
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* 5. Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* 6. Cart Drawer */}
      <CartDrawer />

      {/* 7. Checkout Modal */}
      <CheckoutModal />

      {/* 8. Admin Control Dashboard */}
      <AdminDashboard />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </StoreProvider>
  );
}
