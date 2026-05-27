import React, { useState, useEffect } from 'react';
import { formatPrice } from '../../lib/utils';
import { subscribeToOrders, updateOrderStatus } from '../../lib/api';
import { Order } from '../../types';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

export const OrdersAdmin = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((data) => {
      setOrders(data);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus as any);
      toast.success('Status updated');
    } catch (e: any) {
      toast.error('Failed to update status: ' + e.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Orders</h1>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden text-sm w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-900">{order.id?.substring(0,8)}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{order.shippingAddress.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{formatPrice(order.totalAmount)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id!, e.target.value)}
                    className={`border-none rounded-md px-2 py-1 text-xs font-bold bg-gray-100 ${
                      order.status === 'Delivered' ? 'text-green-800 bg-green-100' :
                      order.status === 'Processing' ? 'text-blue-800 bg-blue-100' :
                      'text-yellow-800 bg-yellow-100'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentMethod} - {order.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
