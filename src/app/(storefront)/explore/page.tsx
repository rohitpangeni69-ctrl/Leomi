"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { ShoppingBag, Heart, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/src/lib/store/cart";
import { toast } from "sonner";
import Image from "next/image";

export default function ExploreFeedPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchVideos = async () => {
      // Allow fallback if products or videos aren't present
      const { data, error } = await supabase
        .from("product_videos")
        .select("*, products(*)")
        .order("created_at", { ascending: false });
        
      if (!error && data) {
        setVideos(data);
      }
      setLoading(false);
    };
    fetchVideos();
  }, [supabase]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading feed...</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">No Videos Yet</h2>
        <p className="text-gray-400 mb-8 text-center max-w-sm">Vendors haven't uploaded any TikTok-style promo videos yet. Check back later!</p>
        <Link href="/" className="bg-white text-black px-6 py-3 rounded-full font-bold">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black overflow-y-scroll snap-y snap-mandatory relative scrollbar-hide">
      <div className="fixed top-0 left-0 w-full p-4 z-50 flex items-center justify-between pointer-events-none">
        <Link href="/" className="text-white hover:text-gray-300 pointer-events-auto">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <span className="text-white font-bold text-lg drop-shadow-md">Explore</span>
        <div className="w-6" />
      </div>

      {videos.map((vid, index) => (
        <VideoReel key={vid.id || index} video={vid} addItem={addItem} />
      ))}
    </div>
  );
}

function VideoReel({ video, addItem }: { video: any, addItem: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.7 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const product = video.products;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent pause/play
    if (!product) return;
    
    addItem({
      id: `${product.id}-default-${Date.now()}`,
      productId: product.id,
      title: product.title,
      price: product.price,
      thumbnail_url: product.thumbnail_url || "",
      quantity: 1,
      size: "M", // Mock size for quick add
      vendorId: product.vendor_id
    });
    toast.success("Added to cart");
  };

  return (
    <div className="h-[100dvh] w-full snap-start relative bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={video.video_url}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted
        onClick={togglePlay}
      />
      
      {/* Overlay UI */}
      <div 
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent"
        onClick={togglePlay}
      />
      
      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
        <button className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition">
          <Heart className="h-7 w-7" />
          <span className="text-xs font-bold mt-1 block drop-shadow-md">24.5k</span>
        </button>
        <button className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition">
          <Share2 className="h-7 w-7" />
          <span className="text-xs font-bold mt-1 block drop-shadow-md">Share</span>
        </button>
        {product && (
           <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white relative mt-4 shadow-lg">
             <Image src={product.thumbnail_url || 'https://via.placeholder.com/150'} alt="thumbnail" fill className="object-cover" />
           </div>
        )}
      </div>

      {/* Bottom Product Info */}
      {product && (
        <div className="absolute bottom-4 left-4 right-20 z-20">
          <Link href={`/product/${product.slug || product.id}`}>
            <h3 className="text-white font-bold text-lg drop-shadow-md hover:underline line-clamp-1">{product.title}</h3>
          </Link>
          <p className="text-white/90 text-sm font-semibold mb-3 drop-shadow-md">Rs. {product.price}</p>
          <div className="flex gap-3">
             <button 
               onClick={handleQuickAdd}
               className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition shadow-lg"
             >
               <ShoppingBag className="h-4 w-4" /> Shop Now
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
