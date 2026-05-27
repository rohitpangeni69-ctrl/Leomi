import React from 'react';
import { formatPrice } from '../../lib/utils';
import { TrendingUp, Package, ShoppingBag, Users } from 'lucide-react';

export const Dashboard = () => {
  const stats = [
    { name: 'Total Revenue', value: formatPrice(125000), icon: TrendingUp },
    { name: 'Total Orders', value: '1,205', icon: ShoppingBag },
    { name: 'Products', value: '45', icon: Package },
    { name: 'Customers', value: '892', icon: Users },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold tracking-tight text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-full">
                <stat.icon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-sm text-gray-500 text-center py-12">
          Charts and analytics will appear here once connected to Firebase.
        </div>
      </div>
    </div>
  );
};
