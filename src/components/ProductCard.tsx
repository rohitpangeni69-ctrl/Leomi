import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/product/${product.id}`} className="group relative block overflow-hidden rounded-md bg-gray-50 border border-gray-100/50 hover:bg-gray-100 transition-colors">
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600'}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {!product.inStock && (
          <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-900 rounded-sm">
            Sold Out
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        <p className="mt-2 text-sm font-semibold text-gray-900">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
};
