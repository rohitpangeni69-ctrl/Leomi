import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Order } from '../types';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  
  const [orderId, setOrderId] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialId) {
      handleTrackQuery(initialId);
    }
  }, [initialId]);

  const handleTrackQuery = async (idToTrack: string) => {
    if (!idToTrack.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const docRef = doc(db, 'orders', idToTrack.trim());
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setOrder({ id: snapshot.id, ...snapshot.data() } as Order);
      } else {
        setOrder(null);
        setError('Order not found. Please check your order ID.');
      }
    } catch (err) {
      setError('Failed to track order. Make sure you are logged in if this is a secure order.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    handleTrackQuery(orderId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="h-8 w-8 text-yellow-500" />;
      case 'Processing': return <Package className="h-8 w-8 text-blue-500" />;
      case 'Shipped': return <Truck className="h-8 w-8 text-purple-500" />;
      case 'Delivered': return <CheckCircle className="h-8 w-8 text-green-500" />;
      default: return <Clock className="h-8 w-8 text-gray-400" />;
    }
  };

  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = order ? steps.indexOf(order.status) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Track Your Order</h1>
      
      <form onSubmit={handleTrack} className="mb-12">
        <label className="block text-sm font-medium text-gray-700 mb-2">Order Tracking ID</label>
        <div className="flex gap-4">
          <input
            type="text"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 px-4 py-3"
            placeholder="e.g. ord_123abc"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !orderId.trim()}
            className="bg-gray-900 text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>

      {order && (
        <div className="bg-white border rounded-lg p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b pb-6">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Order ID</p>
              <p className="font-mono font-bold text-lg">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Status</p>
              <p className="font-bold text-lg text-gray-900">{order.status}</p>
            </div>
          </div>

          <div className="relative mb-12">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded"></div>
            <div 
              className="absolute left-0 top-1/2 h-1 bg-gray-900 -z-10 -translate-y-1/2 rounded transition-all duration-500"
              style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
            ></div>
            
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                return (
                  <div key={step} className="flex flex-col items-center bg-white px-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${isActive ? 'border-gray-900 bg-white text-gray-900' : 'border-gray-200 bg-white text-gray-300'}`}>
                      {getStatusIcon(step)}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} | Size: {item.selectedSize}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
