import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { toast } from 'sonner';
import { useAuthStore } from '../lib/firebase';
import { logProductInteraction } from '../lib/recommendations';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();
  const isWished = isInWishlist(product.id);
  const isFlashSale = product.flashSaleEndTime && product.flashSaleEndTime > Date.now();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!isFlashSale || !product.flashSaleEndTime) return;
    const updateTime = () => {
      const diff = product.flashSaleEndTime! - Date.now();
      if (diff <= 0) {
        setTimeLeft('');
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isFlashSale, product.flashSaleEndTime]);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    try {
      await toggleItem(product.id);
      if (!isWished) {
        toast.success('Added to wishlist');
        logProductInteraction(user.uid, product.id, 'wishlist');
      } else {
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="group relative block overflow-hidden rounded-md bg-gray-50 border border-gray-100/50 hover:bg-gray-100 transition-colors"
      onClick={() => logProductInteraction(user?.uid, product.id, 'click')}
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200 relative">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600'}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {(!product.inStock || (product.stock !== undefined && product.stock <= 0)) && (
          <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-900 rounded-sm">
            Sold Out
          </div>
        )}
        {isFlashSale && timeLeft && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-600 font-mono text-white text-xs font-bold px-2 py-1.5 text-center">
            ⚡ FLASH SALE ends in {timeLeft}
          </div>
        )}
        <button 
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors z-10"
        >
          <Heart className={`h-4 w-4 ${isWished ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        <div className="mt-2 flex items-baseline space-x-2">
          {isFlashSale && product.flashSalePrice ? (
            <>
              <span className="text-sm font-bold text-red-600">{formatPrice(product.flashSalePrice)}</span>
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};
