import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';

// Layouts & Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SEO } from './components/SEO';

// Pages
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { PaymentCallback } from './pages/PaymentCallback';
import { Wishlist } from './pages/Wishlist';
import { Account } from './pages/Account';
import { TrackOrder } from './pages/TrackOrder';
import { requestNotificationPermission } from './lib/fcm';
import { ChatWidget } from './components/ChatWidget';
import { Cursor } from './components/Cursor';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ProductsAdmin } from './pages/admin/Products';
import { OrdersAdmin } from './pages/admin/Orders';
import { useAuthStore } from './lib/firebase';

function App() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user]);

  return (
    <HelmetProvider>
      <div className="hidden sm:block">
        <Cursor />
      </div>
      <BrowserRouter>

        <SEO />
        <Toaster position="top-right" />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
          </Route>

          {/* Public Routes */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/track-order" element={<TrackOrder />} />
                    <Route path="/payment-callback" element={<PaymentCallback />} />
                  </Routes>
                </main>
                <Footer />
                <ChatWidget />
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
