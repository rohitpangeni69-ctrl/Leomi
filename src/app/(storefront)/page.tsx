import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";

export const revalidate = 60; // Revalidate every 60 seconds

async function getTrendingProducts() {
  const supabase = await createClient();
  try {
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8);
    return products || [];
  } catch (error) {
    return [];
  }
}

export default async function StorefrontHome() {
  const trendingProducts = await getTrendingProducts();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center bg-gray-100 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e07?q=80&w=2070&auto=format&fit=crop"
          alt="Hero Image"
          fill
          className="object-cover opacity-80"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-lg mb-6">
            Nepal's Next Era <br className="hidden md:block" /> of Fashion
          </h1>
          <p className="text-lg md:text-xl text-white drop-shadow-md mb-8 max-w-2xl mx-auto font-medium">
            Discover trending styles, unique local vendors, and expressive streetwear.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="#trending" 
              className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition shadow-lg w-full sm:w-auto"
            >
              Shop New Arrivals
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </section>

      {/* Category Grid Section */}
      <section className="py-16 md:py-24 container max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: "Streetwear", img: "https://images.unsplash.com/photo-1523398002811-999aa8d9512e?w=800&q=80" },
            { name: "Sneakers", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80" },
            { name: "Accessories", img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80" },
            { name: "Traditional", img: "https://images.unsplash.com/photo-1583391733959-1c51134cbd45?w=800&q=80" }
          ].map((cat, i) => (
            <Link href={`/category/${cat.name.toLowerCase()}`} key={i} className="group relative block aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
               <div className="absolute bottom-4 left-4 right-4">
                 <h3 className="text-white font-semibold text-lg md:text-xl">{cat.name}</h3>
               </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section id="trending" className="py-16 bg-gray-50 border-t">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-3xl font-bold tracking-tight">Trending Now</h2>
             <Link href="/products" className="text-sm font-medium underline underline-offset-4 hover:text-gray-600">
               View All
             </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {trendingProducts.length === 0 ? (
              <p className="col-span-full text-gray-500 text-center py-10">No products available yet. Check back soon!</p>
            ) : (
              trendingProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.slug || product.id}`} className="group relative block">
                   <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-200">
                     {product.thumbnail_url ? (
                        <Image
                          src={product.thumbnail_url}
                          alt={product.title}
                          fill
                          className="object-cover object-center group-hover:opacity-75 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                     )}
                   </div>
                   <div className="mt-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 group-hover:underline line-clamp-1">{product.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                         <p className="text-sm font-semibold text-gray-900">Rs. {product.price}</p>
                         {product.compare_at_price > product.price && (
                           <p className="text-xs text-gray-500 line-through">Rs. {product.compare_at_price}</p>
                         )}
                      </div>
                   </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
