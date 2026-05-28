import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../lib/firebase';
import { doc, getDoc, setDoc, query, collection, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import { Order } from '../types';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { formatPrice } from '../lib/utils';

export const Account = () => {
  const { user } = useAuthStore();
  const [points, setPoints] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchUserData = async () => {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setPoints(data.points || 0);
        
        if (!data.referralCode) {
          const newCode = `LEOMI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          await setDoc(userRef, { referralCode: newCode }, { merge: true });
          setReferralCode(newCode);
        } else {
          setReferralCode(data.referralCode);
        }
      } else {
        const newCode = `LEOMI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await setDoc(userRef, { 
          points: 0,
          referralCode: newCode,
          email: user.email,
        }, { merge: true });
        setReferralCode(newCode);
      }
    };

    const fetchUserOrders = async () => {
      setLoadingOrders(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    
    fetchUserData();
    fetchUserOrders();
  }, [user]);

  if (!user) return <div className="p-24 text-center">Please login</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Loyalty & Rewards</h2>
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-xl font-bold">
              {points}
            </div>
            <div>
              <p className="font-semibold text-gray-900">Total Points</p>
              <p className="text-sm text-gray-500">Earn 10 points per ₨ 1000 spent.</p>
            </div>
          </div>
          <button className="w-full py-2 bg-gray-100 text-gray-900 font-semibold rounded hover:bg-gray-200" onClick={() => toast.success('Redemption feature coming soon!')}>
            Redeem Points
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Refer a Friend</h2>
          <p className="text-gray-600 text-sm mb-4">Share your unique code and earn 500 bonus points when friends make their first purchase.</p>
          <div className="flex items-center bg-gray-50 p-3 rounded-md mb-4 border border-gray-200">
            <span className="font-mono flex-grow text-gray-800">{referralCode || 'Generating...'}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(referralCode);
                toast.success('Code copied to clipboard!');
              }}
              className="text-sm text-gray-900 font-bold px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Order History</h2>
        {loadingOrders ? (
          <div className="text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-gray-100 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>You haven't placed any orders yet.</p>
            <Link to="/" className="mt-4 inline-block text-gray-900 font-bold underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(order.totalAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/track-order?id=${order.id}`} className="text-gray-900 hover:text-gray-600 underline">Track</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
