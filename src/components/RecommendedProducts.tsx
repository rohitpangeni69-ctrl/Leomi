import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { getRecommendedProducts } from '../lib/recommendations';
import { subscribeToProducts } from '../lib/api';
import { useAuthStore } from '../lib/firebase';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

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
      <h2 className="text-xl font-light tracking-widest text-[#2c2c2c] uppercase font-sans mb-8">
        Recommended For You
      </h2>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12"
      >
        {recommendations.map(product => (
          <ProductCard key={`rec-${product.id}`} product={product} />
        ))}
      </motion.div>
    </div>
  );
};
