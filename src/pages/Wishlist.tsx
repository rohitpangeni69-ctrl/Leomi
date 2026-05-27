import React, { useEffect, useState } from 'react';
import { useWishlistStore } from '../store/wishlistStore';
import { ProductCard } from '../components/ProductCard';
import { useAuthStore } from '../lib/firebase';
import { getProduct } from '../lib/api';
import { Product } from '../types';
import { Link } from 'react-router-dom';

export const Wishlist = () => {
  const { items } = useWishlistStore();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchProducts = async () => {
      setLoading(true);
      const fetched = await Promise.all(items.map(i => getProduct(i.productId)));
      setProducts(fetched.filter(p => p !== null) as Product[]);
      setLoading(false);
    };
    fetchProducts();
  }, [items, user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold font-serif mb-4">Your Wishlist</h2>
        <p className="text-gray-600 mb-8">Please login to view your wishlist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif mb-8">
        My Wishlist
      </h1>
      
      {loading ? (
        <div className="text-center py-24">Loading...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-500">
          <p className="mb-4">Your wishlist is empty.</p>
          <Link to="/" className="text-gray-900 underline font-medium hover:text-gray-600">Continue Shopping</Link>
        </div>
      )}
    </div>
  );
};
