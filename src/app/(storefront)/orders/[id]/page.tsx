import { createClient } from "@/src/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, Truck, Home } from "lucide-react";

const statusSteps = [
  { id: "pending", label: "Pending", icon: Package },
  { id: "processing", label: "Processing", icon: Package },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: Home },
];

export default async function OrderTrackingPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, products(title, thumbnail_url))")
    .eq("id", id)
    .single();

  if (!order) {
    return notFound();
  }

  const currentStepIndex = statusSteps.findIndex(s => s.id === order.status) >= 0 ? statusSteps.findIndex(s => s.id === order.status) : 0;

  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="container max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-10">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">Order Confirmed!</h1>
          <p className="text-gray-500 mt-2">Thank you containing. Your order ID is <span className="font-medium text-black">{order.id.split('-')[0]}</span></p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-2xl border shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-8">Tracking Status</h2>
          
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 hidden sm:block"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-black transition-all hidden sm:block" 
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            ></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                return (
                  <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-2">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 flex items-center justify-center bg-white transition-colors ${isActive ? 'border-black text-black' : 'border-gray-200 text-gray-300'}`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-black' : 'text-gray-400'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-4">Order Details</h2>
            <div className="space-y-4">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative">
                     {item.products?.thumbnail_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.products.thumbnail_url} alt="product" className="w-full h-full object-cover" />
                     )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.products?.title}</p>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                    <p className="font-medium text-sm mt-1">Rs. {item.subtotal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-4">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Amount</span><span>Rs. {order.total_amount}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>Rs. {order.shipping_fee}</span></div>
                <div className="flex justify-between font-bold pt-2 border-t mt-2"><span>Total</span><span>Rs. {parseFloat(order.total_amount) + parseFloat(order.shipping_fee)}</span></div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-500">Payment</span>
                  <span className="capitalize">{order.payment_method} ({order.payment_status})</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-4">Shipping Info</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{order.shipping_address?.addressLine1}</p>
                <p>{order.shipping_address?.city}</p>
                <p>Phone: {order.contact_phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
