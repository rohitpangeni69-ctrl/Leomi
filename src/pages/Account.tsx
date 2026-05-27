import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

export const Account = () => {
  const { user } = useAuthStore();
  const [points, setPoints] = useState(0);
  const [referralCode, setReferralCode] = useState('');

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
    
    fetchUserData();
  }, [user]);

  if (!user) return <div className="p-24 text-center">Please login</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
    </div>
  );
};
