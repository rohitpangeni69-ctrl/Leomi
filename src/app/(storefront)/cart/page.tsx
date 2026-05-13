"use client";

import { useCartStore } from "@/src/lib/store/cart";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="p-8 text-center">Loading cart...</div>;

  if (items.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Trash2 className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Discover trending styles and latest arrivals.
        </p>
        <Link 
          href="/" 
          className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const shipping = 100; // Flat NRS 100 shipping
  const subtotal = getTotal();
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-10">Shopping Cart</h1>
        
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          {/* Cart Items */}
          <section className="lg:col-span-8">
            <ul className="divide-y divide-gray-200 border-t border-b bg-white rounded-2xl shadow-sm overflow-hidden px-4 sm:px-6">
              {items.map((item) => (
                <li key={item.id} className="flex py-6 sm:py-8">
                  <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 border relative">
                    {item.thumbnail_url ? (
                      <Image
                        src={item.thumbnail_url}
                        alt={item.title}
                        fill
                        className="object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 hover:underline">
                            <Link href={`/product/${item.productId}`}>{item.title}</Link>
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">Rs. {item.price}</p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9 flex items-start justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-lg bg-gray-50 h-10">
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 text-gray-600 hover:text-black h-full flex items-center justify-center transition"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            type="button" 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 text-gray-600 hover:text-black h-full flex items-center justify-center transition"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button 
                          type="button" 
                          onClick={() => removeItem(item.id)}
                          className="absolute right-0 top-0 sm:right-0 p-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm sm:shadow-none sm:bg-transparent"
                        >
                          <span className="sr-only">Remove</span>
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Order Summary */}
          <section className="mt-10 lg:col-span-4 lg:mt-0">
            <div className="rounded-2xl border bg-white px-6 py-8 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <dl className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-gray-900">Rs. {subtotal}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Shipping (Standard)</dt>
                  <dd className="font-medium text-gray-900">Rs. {shipping}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-bold text-gray-900">Total order</dt>
                  <dd className="text-base font-bold text-gray-900">Rs. {total}</dd>
                </div>
              </dl>

              <div className="mt-8">
                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center rounded-xl border border-transparent bg-black px-6 py-4 text-base font-medium white shadow-md hover:bg-gray-800 transition active:scale-[0.98] text-white"
                >
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              
              <div className="mt-4 text-center text-xs text-gray-500">
                Taxes are calculated at checkout.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
