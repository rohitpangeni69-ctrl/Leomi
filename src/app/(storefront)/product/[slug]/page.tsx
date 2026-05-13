import { createClient } from "@/src/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AddToCartForm } from "./AddToCartForm";

export const revalidate = 60; // seconds

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Wait for the params to resolve before using properties
  const { slug } = await params;
  
  const supabase = await createClient();

  // Next.js slug can match ID or slug if we set it up. 
  // Let's try matching id first for simplicity assuming slug might contain id.
  let finalProduct: any = {};

  try {
    const { data: product } = await supabase
      .from("products")
      .select("*, product_videos(*)")
      .eq("id", slug) // using id for now as fallback
      .single();

    if (!product) {
      // If id fails, try 'slug' column
      const { data: bySlug } = await supabase
        .from("products")
        .select("*, product_videos(*)")
        .eq("slug", slug)
        .single();
        
      if (!bySlug) return notFound();
      Object.assign(finalProduct, bySlug);
    } else {
      Object.assign(finalProduct, product);
    }
  } catch (error) {
    // If supabase fails due to dummy URL, we ignore or notFound
    return notFound();
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12 xl:gap-x-16">
          {/* Images / Videos */}
          <div className="flex flex-col gap-4 relative">
             <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 relative">
               {finalProduct?.thumbnail_url ? (
                  <Image
                    src={finalProduct.thumbnail_url}
                    alt={finalProduct.title}
                    fill
                    className="object-cover object-center"
                    priority
                    referrerPolicy="no-referrer"
                  />
               ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">No Image</div>
               )}
             </div>
             
             {/* Stub for Video Carousel (TikTok style) */}
             {finalProduct?.product_videos && finalProduct.product_videos.length > 0 && (
               <div className="mt-4">
                 <h4 className="text-sm font-semibold mb-2">Style Videos</h4>
                 <div className="flex gap-2 overflow-x-auto pb-2">
                   {finalProduct.product_videos.map((vid: any) => (
                     <div key={vid.id} className="h-32 w-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden relative">
                        <video src={vid.video_url} className="h-full w-full object-cover rounded-lg" playsInline muted loop />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                           <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                              <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-1" />
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{finalProduct?.title}</h1>
            
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-gray-900">Rs. {finalProduct?.price}</p>
                {finalProduct?.compare_at_price > finalProduct?.price && (
                  <p className="text-lg text-gray-500 line-through">Rs. {finalProduct.compare_at_price}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-gray-700 whitespace-pre-line leading-relaxed">
                {finalProduct?.description || "No description provided."}
              </div>
            </div>

            {/* Client Add to Cart Form */}
            <AddToCartForm product={finalProduct} />
            
          </div>
        </div>
      </div>
    </div>
  );
}
