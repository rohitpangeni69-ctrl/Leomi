import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { Package, ShoppingBag, Users, LayoutDashboard, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../lib/firebase';

export const AdminLayout = () => {
  const location = useLocation();
  const { isAdmin, isReady } = useAuthStore();

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center">Loading admin panel...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '#', icon: Users },
    { name: 'Settings', href: '#', icon: Settings },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 hidden md:block">
        <div className="h-full flex flex-col py-6">
          <div className="px-4 mb-6">
            <h2 className="text-xl font-bold tracking-tight">Admin Area</h2>
          </div>
          <nav className="flex-1 space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-2.5 text-sm font-medium rounded-md group transition-colors",
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-700")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-white p-6 lg:p-8">
        <Outlet />
      </div>
    </div>
  );
};
