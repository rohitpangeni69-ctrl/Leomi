"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/src/lib/store/cart";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { processCheckout } from "../../actions/checkout";

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [deliveryArea, setDeliveryArea] = useState<"ktm" | "outside">("ktm");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "esewa" | "khalti">("cod");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="p-8 text-center">Loading checkout...</div>;

  if (items.length === 0) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => router.push("/")} className="text-blue-600 hover:underline">
          Go back to shopping
        </button>
      </div>
    );
  }

  const subtotal = getTotal();
  const shippingFee = deliveryArea === "ktm" ? 100 : 250;
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("paymentMethod", paymentMethod);

    // Mock eSewa/Khalti flow
    if (paymentMethod === "esewa" || paymentMethod === "khalti") {
      toast.info(`Redirecting to ${paymentMethod === "esewa" ? "eSewa" : "Khalti"} payment gateway... (Mock)`);
      await new Promise(r => setTimeout(r, 1500));
      // In real scenario, redirect to eSewa form URL
    }

    const result = await processCheckout(formData, items, total, shippingFee);

    if (result.success) {
      toast.success("Order placed successfully!");
      clearCart();
      router.push(`/orders/${result.orderId}`);
    } else {
      toast.error(result.error || "Failed to place order. Are you logged in?");
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-12">
      <div className="container max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          
          <div className="lg:col-span-8 space-y-8">
            {/* Delivery Info */}
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Delivery Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input required name="fullName" className="w-full border rounded-md px-3 py-2 outline-none focus:border-black" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input required name="phone" type="tel" className="w-full border rounded-md px-3 py-2 outline-none focus:border-black" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Delivery Address (Street / Landmark)</label>
                  <textarea required name="addressLine1" rows={2} className="w-full border rounded-md px-3 py-2 outline-none focus:border-black" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium mb-1">City / Region</label>
                  <select 
                    required 
                    name="city" 
                    className="w-full border rounded-md px-3 py-2 outline-none focus:border-black"
                    onChange={(e) => setDeliveryArea(e.target.value.toLowerCase().includes('kathmandu') || e.target.value.toLowerCase().includes('lalitpur') || e.target.value.toLowerCase().includes('bhaktapur') ? 'ktm' : 'outside')}
                  >
                    <option value="Kathmandu">Kathmandu Valley</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Chitwan">Chitwan</option>
                    <option value="Other">Other City (Outside Valley)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="paymentType" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-4 w-4 text-black focus:ring-black" />
                  <span className="ml-3 font-medium">Cash on Delivery (COD)</span>
                </label>
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${paymentMethod === 'esewa' ? 'border-green-600 bg-green-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="paymentType" value="esewa" checked={paymentMethod === 'esewa'} onChange={() => setPaymentMethod('esewa')} className="h-4 w-4 text-green-600 focus:ring-green-600" />
                  <span className="ml-3 font-medium text-green-700">eSewa Mobile Wallet</span>
                </label>
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${paymentMethod === 'khalti' ? 'border-purple-600 bg-purple-50' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="paymentType" value="khalti" checked={paymentMethod === 'khalti'} onChange={() => setPaymentMethod('khalti')} className="h-4 w-4 text-purple-600 focus:ring-purple-600" />
                  <span className="ml-3 font-medium text-purple-700">Khalti Digital Wallet</span>
                </label>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 mt-8 lg:mt-0">
            {/* Order Summary */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.title} (x{item.quantity})</span>
                    <span className="font-medium">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Rs. {shippingFee}</span>
                </div>
                <div className="flex justify-between border-t border-black pt-3 text-base font-bold">
                  <span>Total</span>
                  <span>Rs. {total}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-xl font-medium mt-8 hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
