import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, User, LogOut, Heart, Globe } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { auth, useAuthStore } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { cn } from '../lib/utils';

export const Navbar = () => {
  const items = useCartStore(state => state.items);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const { t, i18n } = useTranslation();
  
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Successfully logged in');
    } catch (error: any) {
      toast.error('Failed to login: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out');
      navigate('/');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 ease-in-out border-b border-transparent",
        isScrolled ? "bg-white/70 backdrop-blur-md border-gray-100 py-2 shadow-sm" : "bg-transparent py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12 items-center">
          <div className="flex items-center">
            <button className="p-2 -ml-2 mr-2 md:hidden text-gray-600">
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="text-2xl font-bold tracking-tighter text-gray-900 font-serif">
              LEOMI.
            </Link>
            <div className="hidden md:ml-10 md:flex space-x-8">
              <Link to="/?category=Women" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t('Women')}</Link>
              <Link to="/?category=Men" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t('Men')}</Link>
              <Link to="/?category=Accessories" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t('Accessories')}</Link>
              <Link to="/track-order" className="text-sm font-medium text-gray-600 hover:text-gray-900">Track Order</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <button onClick={toggleLanguage} className="text-gray-600 hover:text-gray-900 flex items-center gap-1 group relative">
              <Globe className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase">{i18n.language === 'ne' ? 'NE' : 'EN'}</span>
            </button>
            <button className="text-gray-600 hover:text-gray-900 hidden sm:block">
              <Search className="h-5 w-5" />
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Link to="/admin" className="text-xs font-semibold uppercase tracking-wider text-gray-900 bg-gray-100 px-2 py-1 rounded hidden sm:block">
                    Admin
                  </Link>
                )}
                <Link to="/account" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900">{user.displayName || user.email?.split('@')[0]}</Link>
                <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="text-gray-600 hover:text-gray-900 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline-block">Login</span>
              </button>
            )}

            <Link to="/wishlist" className="text-gray-600 hover:text-gray-900 relative hidden sm:block">
              <Heart className="h-5 w-5" />
            </Link>

            <Link to="/cart" className="text-gray-600 hover:text-gray-900 relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
