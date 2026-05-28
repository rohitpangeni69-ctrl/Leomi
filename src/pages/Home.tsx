import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { RecommendedProducts } from '../components/RecommendedProducts';
import { subscribeToProducts } from '../lib/api';
import { Product } from '../types';
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

export const Home = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
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

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }

  if (minPrice && !isNaN(Number(minPrice))) {
    filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice && !isNaN(Number(maxPrice))) {
    filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="pb-12"
    >
      {!categoryFilter && !searchQuery && (
        <section className="relative h-[85vh] w-full overflow-hidden mb-16">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')" }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl font-sans tracking-tight text-white mb-6 uppercase max-w-4xl"
            >
              Quiet Luxury, <br/>Defined.
            </motion.h1>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-white/90 font-light tracking-wide mb-10 max-w-xl"
            >
              Explore our curated collection of premium garments designed for the modern minimal aesthetic.
            </motion.p>
            <motion.button
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="px-8 py-3 bg-white text-gray-900 text-sm tracking-widest uppercase hover:bg-[#C1A88A] hover:text-white transition-colors duration-300"
            >
              Explore Collection
            </motion.button>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <h2 className="text-2xl font-light tracking-widest text-[#2c2c2c] uppercase font-sans">
            {categoryFilter ? `${categoryFilter} Collection` : 'Curated Edition'}
          </h2>
          <div className="flex flex-wrap items-center gap-6">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-b border-gray-300 bg-transparent text-sm py-2 px-1 focus:outline-none focus:border-[#C1A88A] w-full sm:w-auto transition-colors"
            />
            <div className="flex items-center space-x-4">
              <label htmlFor="sort" className="text-xs uppercase tracking-widest text-gray-500">Sort</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-b border-gray-300 text-sm py-2 px-1 focus:outline-none focus:border-[#C1A88A]"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Ascending</option>
                <option value="price-high">Price: Descending</option>
              </select>
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12"
          >
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-24 text-gray-500 font-light">
            No items curated in this selection yet.
          </div>
        )}
        
        <div className="mt-24 border-t border-gray-200/50">
          <RecommendedProducts />
        </div>
      </div>
    </motion.div>
  );
};
