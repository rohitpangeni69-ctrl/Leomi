import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { RecommendedProducts } from '../components/RecommendedProducts';
import { subscribeToProducts } from '../lib/api';
import { Product } from '../types';

export const Home = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  const [sortBy, setSortBy] = useState('newest');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  let filteredProducts = [...products];
  if (categoryFilter) {
    filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
  }

  // Sorting logic
  if (sortBy === 'price-low') filteredProducts.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') filteredProducts.sort((a, b) => b.price - a.price);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">
          {categoryFilter ? `${categoryFilter} Collection` : 'Featured Products'}
        </h1>
        <div className="flex items-center space-x-4">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-gray-300 rounded-md text-sm py-2 pl-3 pr-10 focus:ring-gray-900 focus:border-gray-900"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-500">
          No products found in this category.
        </div>
      )}
      
      <RecommendedProducts />
    </div>
  );
};
