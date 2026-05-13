import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function VendorsPage() {
  const vendors = [
    {
      id: "1",
      name: "Sneaker Hub KTM",
      followers: "12K",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      verified: true
    },
    {
      id: "2",
      name: "Thamel Streetwear",
      followers: "8.5K",
      img: "https://images.unsplash.com/photo-1528701800487-ba01fea498c0?w=400&q=80",
      verified: true
    },
    {
      id: "3",
      name: "Kathmandu Kicks",
      followers: "5K",
      img: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400&q=80",
      verified: false
    },
    {
      id: "4",
      name: "Himalayan Styles",
      followers: "24K",
      img: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&q=80",
      verified: true
    }
  ];

  return (
    <div className="bg-gray-50/50 min-h-screen">
      {/* Hero Banner */}
      <section className="bg-black py-20 px-4">
        <div className="container max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Explore Brands & Creators</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Follow your favorite local Nepali vendors and get notified about their latest drops and exclusive TikTok-style promos.</p>
        </div>
      </section>

      <section className="container max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="h-32 bg-gray-200 relative">
                <Image src={vendor.img} alt={vendor.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="p-6 text-center relative -mt-10">
                <div className="w-16 h-16 bg-white rounded-full mx-auto shadow-md border-4 border-white flex items-center justify-center font-bold text-xl relative">
                  {vendor.name.charAt(0)}
                  {vendor.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                       <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mt-4">{vendor.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{vendor.followers} Followers</p>
                <div className="mt-6 flex justify-center gap-2">
                  <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 w-full">
                    Follow
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 bg-blue-50 rounded-3xl p-8 md:p-12 text-center border border-blue-100">
           <h2 className="text-2xl font-bold mb-4">Want to sell on Leomi?</h2>
           <p className="text-gray-600 mb-8 max-w-xl mx-auto">Join Nepal's fastest-growing fashion marketplace. Upload short video promos, manage inventory, and reach thousands of customers.</p>
           <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition shadow-lg">Become a Vendor</button>
        </div>
      </section>
    </div>
  );
}
