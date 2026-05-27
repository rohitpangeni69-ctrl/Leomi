import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-xl font-bold tracking-tighter text-gray-900 font-serif">
              LEOMI.
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Redefining fashion in Nepal with premium quality and accessible bridging.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Shop</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/?category=Women" className="text-sm text-gray-500 hover:text-gray-900">Women</Link></li>
              <li><Link to="/?category=Men" className="text-sm text-gray-500 hover:text-gray-900">Men</Link></li>
              <li><Link to="/?category=Accessories" className="text-sm text-gray-500 hover:text-gray-900">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Contact Us</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Shipping Policy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Returns & Exchanges</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Payments Custom</h3>
            <p className="mt-4 text-sm text-gray-500">
              We accept digital payments securely via eSewa and Khalti on delivery.
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Leomi Fashion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
