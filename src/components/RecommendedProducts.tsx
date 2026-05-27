import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { getRecommendedProducts } from '../lib/recommendations';
import { subscribeToProducts } from '../lib/api';
import { useAuthStore } from '../lib/firebase';

export const RecommendedProducts = () => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let allProducts: Product[] = [];
    const unsubscribe = subscribeToProducts(async (products) => {
      allProducts = products;
      const recs = await getRecommendedProducts(user?.uid, allProducts);
      setRecommendations(recs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return null;
  if (recommendations.length === 0) return null;

  return (
    <div className="my-16">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-serif mb-6">
        Recommended For You
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map(product => (
          <ProductCard key={`rec-${product.id}`} product={product} />
        ))}
      </div>
    </div>
  );
};
