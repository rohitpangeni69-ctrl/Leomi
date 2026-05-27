import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '../lib/firebase';
import { createOrder } from '../lib/api';
import { v4 as uuidv4 } from 'uuid';
import { simulatePushNotification } from '../lib/fcm';

export const Checkout = () => {
  const { items, total, clearCart } = useCartStore();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const esewaFormRef = useRef<HTMLFormElement>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<'eSewa' | 'Khalti' | 'COD'>('eSewa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    city: 'Kathmandu',
    area: '',
    street: ''
  });

  const [referralCode, setReferralCode] = useState('');

  const subtotal = total();
  const shippingFlow = 150; // Flat standard shipping in KTM
  const orderTotal = subtotal + shippingFlow;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }
    setIsProcessing(true);
    
    try {
      const oid = uuidv4().replace(/-/g, '').substring(0, 20); // shortened UUID for eSewa
      setCurrentOrderId(oid);
      
      const orderData = {
        userId: user.uid,
        items,
        totalAmount: orderTotal,
        status: 'Pending' as const,
        shippingAddress,
        paymentMethod,
        paymentStatus: 'Pending' as const,
      };

      await createOrder(orderData, oid);

      if (referralCode) {
        // dynamic import or assume applyReferralCode is available
        const { applyReferralCode } = await import('../lib/api');
        const applied = await applyReferralCode(referralCode, user.uid);
        if (applied) {
          toast.success('Referral code applied!');
        } else {
          toast.error('Invalid referral code');
        }
      }

      if (paymentMethod === 'eSewa') {
        // Form submit directly since we have hidden form
        setTimeout(() => {
          if (esewaFormRef.current) {
            esewaFormRef.current.submit();
          }
        }, 500);
      } else if (paymentMethod === 'COD') {
        clearCart();
        toast.success('Order placed successfully (Cash on Delivery)');
        simulatePushNotification('Order Confirmed!', `Your order ${oid} has been placed successfully.`);
        navigate('/');
      } else {
        toast.error('Khalti not implemented in this demo. Proceed with COD or eSewa.');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to create order: ' + error.message);
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const successUrl = `${window.location.origin}/payment-callback?q=su`;
  const failureUrl = `${window.location.origin}/payment-callback?q=fu`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Shipping Form */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Checkout</h2>
          <form onSubmit={handleCheckout} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-gray-900 focus:border-gray-900"
                  value={shippingAddress.fullName}
                  onChange={e => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                />
                <input
                  required
                  type="tel"
                  placeholder="Phone Number (e.g., 98XXXXXXXX)"
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-gray-900 focus:border-gray-900"
                  value={shippingAddress.phone}
                  onChange={e => setShippingAddress({...shippingAddress, phone: e.target.value})}
                />
                <select
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-gray-900 focus:border-gray-900"
                  value={shippingAddress.city}
                  onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})}
                >
                  <option value="Kathmandu">Kathmandu</option>
                  <option value="Lalitpur">Lalitpur</option>
                  <option value="Bhaktapur">Bhaktapur</option>
                  <option value="Pokhara">Pokhara</option>
                </select>
                <input
                  required
                  type="text"
                  placeholder="Area / Tole"
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-gray-900 focus:border-gray-900"
                  value={shippingAddress.area}
                  onChange={e => setShippingAddress({...shippingAddress, area: e.target.value})}
                />
                <input
                  required
                  type="text"
                  placeholder="Street Address, House No."
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-gray-900 focus:border-gray-900"
                  value={shippingAddress.street}
                  onChange={e => setShippingAddress({...shippingAddress, street: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Referral Code (Optional)"
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-gray-900 focus:border-gray-900"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-3">
                {['eSewa', 'Khalti', 'COD'].map((method) => (
                  <label key={method} className="flex items-center space-x-3 cursor-pointer p-4 border rounded-md hover:bg-gray-50 border-gray-200">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="text-gray-900 focus:ring-gray-900 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {method === 'COD' ? 'Cash on Delivery (COD)' : `Pay with ${method}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-gray-900 text-white rounded-md p-4 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : `Place Order • ${formatPrice(orderTotal)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit sticky top-24">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
          <ul className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex space-x-4">
                <img src={item.images[0]} alt={item.name} className="h-16 w-16 object-cover rounded border border-gray-200" />
                <div className="flex-1 text-sm text-gray-700">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p>Color: {item.selectedColor}, Size: {item.selectedSize}</p>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatPrice(shippingFlow)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {paymentMethod === 'eSewa' && currentOrderId && (
        <form ref={esewaFormRef} action="https://uat.esewa.com.np/epay/main" method="POST" style={{ display: 'none' }}>
          <input value={orderTotal} name="tAmt" type="hidden" />
          <input value={subtotal} name="amt" type="hidden" />
          <input value="0" name="txAmt" type="hidden" />
          <input value="0" name="psc" type="hidden" />
          <input value={shippingFlow} name="pdc" type="hidden" />
          <input value="EPAYTEST" name="scd" type="hidden" />
          <input value={currentOrderId} name="pid" type="hidden" />
          <input value={`${successUrl}&oid=${currentOrderId}&amt=${orderTotal}`} type="hidden" name="su" />
          <input value={`${failureUrl}&oid=${currentOrderId}&amt=${orderTotal}`} type="hidden" name="fu" />
        </form>
      )}
    </div>
  );
};
