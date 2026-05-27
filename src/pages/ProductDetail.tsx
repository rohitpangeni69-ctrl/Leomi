import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCartStore } from '../store/cartStore';
import { formatPrice, cn } from '../lib/utils';
import { getProduct } from '../lib/api';
import { Product } from '../types';
import { SEO } from '../components/SEO';
import { RecommendedProducts } from '../components/RecommendedProducts';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../lib/firebase';
import { logProductInteraction } from '../lib/recommendations';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      getProduct(id).then(data => {
        setProduct(data);
        setLoading(false);
        if (data && user) {
          logProductInteraction(user.uid, id, 'view');
        }
      });
    }
  }, [id, user]);

  useEffect(() => {
    if (!product || !product.flashSaleEndTime || product.flashSaleEndTime < Date.now()) return;
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
  }, [product]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-24 text-center">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-semibold">Product Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-gray-600 underline">Return Home</button>
      </div>
    );
  }

  const isWished = isInWishlist(product.id);
  const isFlashSale = product.flashSaleEndTime && product.flashSaleEndTime > Date.now();
  const outOfStock = !product.inStock || (product.stock !== undefined && product.stock <= 0);

  const handleWishlist = async () => {
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

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }
    addItem({
      ...product,
      quantity,
      selectedSize,
      selectedColor,
      price: (isFlashSale && product.flashSalePrice) ? product.flashSalePrice : product.price
    });
    toast.success('Added to cart');
  };

  return (
    <>
      <SEO 
        title={`${product.name} | LEOMI`} 
        description={product.description}
        image={product.images[0]} 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
        {/* Image gallery */}
        <div className="flex flex-col-reverse">
          <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-center object-cover"
            />
          </div>
        </div>

        {/* Product info */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 relative">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif pr-12">{product.name}</h1>
            <button 
              onClick={handleWishlist}
              className="absolute top-0 right-0 p-2 bg-white hover:bg-gray-50 rounded-full transition-colors border border-gray-200"
            >
              <Heart className={`h-6 w-6 ${isWished ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>

          <div className="mt-3 flex items-end space-x-4">
            {isFlashSale && product.flashSalePrice ? (
              <>
                <p className="text-3xl tracking-tight text-red-600 font-bold">{formatPrice(product.flashSalePrice)}</p>
                <p className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</p>
              </>
            ) : (
              <p className="text-2xl tracking-tight text-gray-900">{formatPrice(product.price)}</p>
            )}
          </div>
          
          {isFlashSale && timeLeft && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-md p-3 flex items-center justify-between">
              <span className="text-red-800 font-medium text-sm">⚡ Flash Sale</span>
              <span className="bg-red-600 text-white font-mono text-sm px-2 py-1 rounded font-bold">Ends in {timeLeft}</span>
            </div>
          )}

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <p className="text-base text-gray-700">{product.description}</p>
          </div>

          <form className="mt-8" onSubmit={e => { e.preventDefault(); handleAddToCart(); }}>
            {/* Colors */}
            <div>
              <h3 className="text-sm font-medium text-gray-900">Color</h3>
              <div className="mt-4 flex items-center space-x-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none ring-gray-900 border",
                      selectedColor === color ? "ring-2 border-transparent" : "border-gray-200"
                    )}
                  >
                    <span className="sr-only">{color}</span>
                    <span className="h-8 w-8 rounded-full border border-black/10 flex items-center justify-center text-xs font-medium bg-gray-50">
                      {color}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Size</h3>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 sm:py-6",
                      selectedSize === size
                        ? "border-transparent bg-gray-900 text-white hover:bg-gray-800"
                        : "border-gray-200 bg-white text-gray-900"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={outOfStock}
              className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-gray-900 px-8 py-3 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </form>
        </div>
      </div>
      
      <RecommendedProducts />
    </div>
    </>
  );
};
