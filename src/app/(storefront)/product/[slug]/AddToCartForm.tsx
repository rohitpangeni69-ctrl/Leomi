"use client";

import { useState } from "react";
import { useCartStore } from "@/src/lib/store/cart";
import { ShoppingBag, Star, Check } from "lucide-react";
import { toast } from "sonner";

export function AddToCartForm({ product }: { product: any }) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const addItem = useCartStore((state) => state.addItem);
  
  const sizes = ["S", "M", "L", "XL"]; // Mock sizes if not in DB yet
  const inStock = product.stock_quantity > 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    
    addItem({
      id: `${product.id}-${selectedSize}-${Date.now()}`,
      productId: product.id,
      title: product.title,
      price: product.price,
      thumbnail_url: product.thumbnail_url || "",
      quantity: 1,
      size: selectedSize,
      vendorId: product.vendor_id
    });
    
    toast.success("Added to cart");
  };

  return (
    <div className="mt-8">
      {/* Size Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Size</h3>
          <button type="button" className="text-sm text-blue-600 hover:underline">Size Guide</button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`flex items-center justify-center rounded-md border py-3 text-sm font-medium uppercase transition-colors
                ${
                  selectedSize === size
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                }
              `}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!inStock}
        onClick={handleAddToCart}
        className={`flex w-full items-center justify-center rounded-xl px-8 py-4 text-base font-medium text-white shadow-md transition-all
          ${inStock 
            ? "bg-black hover:bg-gray-800 active:scale-[0.98]" 
            : "bg-gray-300 cursor-not-allowed"
          }
        `}
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {inStock ? "Add to Cart" : "Out of Stock"}
      </button>

      {/* Trust Badges */}
      <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          <span>Authentic Quality</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          <span>Cash on Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          <span>2-3 Days Shipping</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-500" />
          <span>Easy Returns</span>
        </div>
      </div>
    </div>
  );
}
