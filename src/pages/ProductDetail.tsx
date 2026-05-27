import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCartStore } from '../store/cartStore';
import { formatPrice, cn } from '../lib/utils';
import { MOCK_PRODUCTS } from '../lib/mockData';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-semibold">Product Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-gray-600 underline">Return Home</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }
    addItem({
      ...product,
      quantity,
      selectedSize,
      selectedColor
    });
    toast.success('Added to cart');
  };

  return (
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
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">{product.name}</h1>
          <div className="mt-3">
            <p className="text-2xl tracking-tight text-gray-900">{formatPrice(product.price)}</p>
          </div>

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
              disabled={!product.inStock}
              className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-gray-900 px-8 py-3 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
