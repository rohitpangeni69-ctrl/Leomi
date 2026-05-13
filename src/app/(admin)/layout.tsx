"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Video, Settings, LogOut } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { createClient } from "@/src/lib/supabase/client";

export const dynamic = 'force-dynamic';

const navItems = [

  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Promo Videos", href: "/admin/videos", icon: Video },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-gray-50/50">
      <div className="w-full flex-none md:w-64 bg-white border-r">
        <div className="flex h-14 items-center border-b px-4 font-semibold text-lg tracking-tight">
          Leomi Admin
        </div>
        <nav className="flex flex-col gap-2 p-4 h-[calc(100vh-3.5rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100",
                  pathname.startsWith(item.href) ? "bg-gray-100 text-blue-600" : "text-gray-600"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
          
          <button 
            onClick={handleLogout}
            className="mt-auto flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </nav>
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        {children}
      </div>
    </div>
  );
}
