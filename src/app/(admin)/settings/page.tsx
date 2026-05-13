"use client";
import { Users, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [multiVendorEnabled, setMultiVendorEnabled] = useState(false);

  const handleToggle = () => {
    setMultiVendorEnabled(!multiVendorEnabled);
    toast.success(`Multi-vendor mode ${!multiVendorEnabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-gray-500">Manage your store preferences and platform architecture.</p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 sm:p-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Users className="h-5 w-5" /> Platform Architecture
        </h2>

        <div className="flex items-start justify-between p-4 border rounded-xl bg-gray-50">
          <div className="max-w-xl">
            <h3 className="font-semibold text-gray-900">Multi-Vendor Mode</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Enable third-party vendors to register, upload products, and manage their own inventory. 
              Commissions will be split based on the vendor agreement.
            </p>
            {multiVendorEnabled && (
               <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md mb-4 font-medium">
                 <AlertTriangle className="h-4 w-4" /> Feature active: Vendor registration is open.
               </div>
            )}
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={multiVendorEnabled} onChange={handleToggle} />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
