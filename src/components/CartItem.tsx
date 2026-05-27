import React from 'react';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../lib/utils';
import { Trash2, Plus, Minus } from 'lucide-react';

export const CartItem = ({ item }: { item: any }) => {
  const { removeItem, updateQuantity } = useCartStore();

  return (
    <li className="flex py-6">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover object-center" />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>{item.name}</h3>
            <p className="ml-4">{formatPrice(item.price * item.quantity)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">{item.selectedColor} | Size: {item.selectedSize}</p>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center border border-gray-200 rounded">
            <button
              onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, Math.max(1, item.quantity - 1))}
              className="p-1 hover:bg-gray-50 text-gray-600"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-2 py-1 font-medium">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
              className="p-1 hover:bg-gray-50 text-gray-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
            className="font-medium text-red-600 hover:text-red-500 p-2"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </li>
  );
};
