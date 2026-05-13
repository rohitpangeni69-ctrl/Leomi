"use client";

import Link from "next/link";
import { useCartStore } from "@/src/lib/store/cart";
import { ShoppingBag, Search, Menu, User } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 -ml-2 text-gray-600 hover:text-black">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="font-bold tracking-tighter text-xl sm:text-2xl">
            LEOMI
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/explore" className="hover:text-black flex items-center gap-1">
             <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            Explore Reels
          </Link>
          <Link href="/vendors" className="hover:text-black">Brands</Link>
          <Link href="/category/men" className="hover:text-black">Men</Link>
          <Link href="/category/women" className="hover:text-black">Women</Link>
          <Link href="/#trending" className="hover:text-black font-semibold">Trending</Link>
        </nav>

        {/* Global Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="p-2 text-gray-600 hover:text-black hidden sm:block">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/login" className="p-2 text-gray-600 hover:text-black">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="relative p-2 text-gray-600 hover:text-black">
            <ShoppingBag className="h-5 w-5" />
            {isMounted && itemCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
