import React, { useEffect, useState, useMemo } from 'react';
import { formatPrice } from '../../lib/utils';
import { TrendingUp, Package, ShoppingBag, Users, Lightbulb } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { subscribeToOrders, subscribeToProducts } from '../../lib/api';
import { Order, Product } from '../../types';

export const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsubOrders = subscribeToOrders(setOrders);
    const unsubProducts = subscribeToProducts(setProducts);
    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((acc, order) => acc + order.totalAmount, 0), [orders]);
  
  const customerIds = new Set(orders.map(o => o.userId));

  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(name => ({ name, revenue: 0 }));
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      if (Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
        data[date.getDay()].revenue += order.totalAmount;
      }
    });
    return data;
  }, [orders]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        counts[item.category] = (counts[item.category] || 0) + item.price * item.quantity;
      });
    });
    return Object.entries(counts).map(([name, sales]) => ({ name, sales }));
  }, [orders]);

  const insights = useMemo(() => {
    const tips = [];
    if (orders.length === 0) {
      tips.push("Welcome! Start sharing your store link to get your first orders.");
    } else {
      if (totalRevenue > 10000) {
        tips.push(`Great job! You've crossed ${formatPrice(10000)} in total revenue.`);
      }
      if (categoryData.length > 0) {
        const topCat = [...categoryData].sort((a, b) => b.sales - a.sales)[0];
        tips.push(`Your top performing category is ${topCat.name}. Consider adding more items to this category.`);
      }
      
      const lowStock = products.filter(p => (p.stock || 0) < 5);
      if (lowStock.length > 0) {
        tips.push(`You have ${lowStock.length} items with low stock. Restock them soon to avoid lost sales.`);
      }
    }
    return tips;
  }, [orders, products, totalRevenue, categoryData]);

  const stats = [
    { name: 'Total Revenue', value: formatPrice(totalRevenue), icon: TrendingUp },
    { name: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag },
    { name: 'Products', value: products.length.toString(), icon: Package },
    { name: 'Customers', value: customerIds.size.toString(), icon: Users },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Business Insights & Guidance</h2>
        </div>
        <ul className="space-y-3">
          {insights.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-3 bg-yellow-50/50 p-4 rounded-md border border-yellow-100">
              <span className="text-yellow-600 font-bold">•</span>
              <p className="text-sm text-gray-800">{tip}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Trends (Last 7 Days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `Rs.${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip formatter={(value: number) => formatPrice(value)} />
                <Area type="monotone" dataKey="revenue" stroke="#111827" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sales by Category</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Bar dataKey="sales" fill="#111827" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
