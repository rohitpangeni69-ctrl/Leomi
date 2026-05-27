import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { updateOrderStatus } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';
import { simulatePushNotification } from '../lib/fcm';

export const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCartStore(state => state.clearCart);
  const [status, setStatus] = useState('Processing Payment...');

  useEffect(() => {
    const processPayment = async () => {
      const q = searchParams.get('q');
      const oid = searchParams.get('oid');
      const amt = searchParams.get('amt');
      const refId = searchParams.get('refId');

      if (!oid) {
        setStatus('Invalid Payment Request');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (q === 'su') {
        try {
          await updateOrderStatus(oid, 'Processing', 'Completed');
          toast.success('Payment successful! Order placed.');
          simulatePushNotification('Payment Successful', `Your order ${oid} is now processing.`);
          clearCart();
          navigate('/');
        } catch (error) {
          console.error(error);
          setStatus('Failed to update order status');
        }
      } else if (q === 'fu') {
        try {
          await updateOrderStatus(oid, 'Cancelled', 'Failed');
          toast.error('Payment failed or cancelled.');
          simulatePushNotification('Payment Failed', `Your payment for order ${oid} could not be completed.`);
          navigate('/checkout');
        } catch (error) {
          console.error(error);
          setStatus('Failed to update order status');
        }
      }
    };

    processPayment();
  }, [searchParams, navigate, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl font-semibold">{status}</div>
    </div>
  );
};
