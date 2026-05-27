import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { CartItem } from '../components/CartItem';
import { formatPrice } from '../lib/utils';

export const Cart = () => {
  const { items, total } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4 font-serif">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <button onClick={() => navigate('/')} className="bg-gray-900 text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8 font-serif">Shopping Cart</h1>
      
      <div className="mt-8">
        <div className="flow-root">
          <ul role="list" className="-my-6 divide-y divide-gray-200 border-t border-b border-gray-200">
            {items.map((item, index) => (
              <CartItem key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${index}`} item={item} />
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-200 bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
          <p>Subtotal</p>
          <p>{formatPrice(total())}</p>
        </div>
        <p className="mt-0.5 text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/checkout')}
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800"
          >
            Proceed to Checkout
          </button>
        </div>
        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
          <p>
            or{' '}
            <Link to="/" className="font-medium text-gray-900 hover:text-gray-700">
              Continue Shopping
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
