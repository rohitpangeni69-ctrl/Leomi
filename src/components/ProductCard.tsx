import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { toast } from 'sonner';
import { useAuthStore } from '../lib/firebase';
import { logProductInteraction } from '../lib/recommendations';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

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
    <motion.div variants={itemVariants}>
      <Link 
        to={`/product/${product.id}`} 
        className="group relative block overflow-hidden rounded-sm hover:-translate-y-1 transition-transform duration-500 ease-out"
        onClick={() => logProductInteraction(user?.uid, product.id, 'click')}
      >
        <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100 relative group-hover:shadow-[0_0_15px_rgba(193,168,138,0.3)] transition-shadow duration-500">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600'}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Fading view details button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <span className="bg-white/90 px-6 py-2 text-xs uppercase tracking-widest text-gray-900 shadow-sm backdrop-blur-sm">
              View details
            </span>
          </div>

          {(!product.inStock || (product.stock !== undefined && product.stock <= 0)) && (
            <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-900">
              Sold Out
            </div>
          )}
          {isFlashSale && timeLeft && (
            <div className="absolute bottom-3 left-3 bg-[#8B2E2E] font-mono text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-sm">
              Flash: {timeLeft}
            </div>
          )}
          <button 
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 bg-white/50 backdrop-blur-sm hover:bg-white rounded-full transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
          >
            <Heart className={`h-4 w-4 ${isWished ? 'fill-red-500 text-red-500' : 'text-gray-900'}`} />
          </button>
        </div>
        <div className="pt-4 pb-2">
          <h3 className="text-sm font-light text-[#2c2c2c] line-clamp-1 uppercase tracking-wide">{product.name}</h3>
          <p className="mt-1 text-xs text-gray-400 capitalize tracking-widest">{product.category}</p>
          <div className="mt-2 flex items-baseline space-x-2">
            {isFlashSale && product.flashSalePrice ? (
              <>
                <span className="text-sm font-medium text-[#8B2E2E]">{formatPrice(product.flashSalePrice)}</span>
                <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
