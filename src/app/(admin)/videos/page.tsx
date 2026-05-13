"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Video as VideoIcon } from "lucide-react";

export default function AdminVideosPage() {
  const supabase = createClient();
  const [videos, setVideos] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [productId, setProductId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const { data: vids, error: vidError } = await supabase
      .from("product_videos")
      .select("*, products(title)");
    
    const { data: prods, error: prodError } = await supabase
      .from("products")
      .select("id, title")
      .eq("is_active", true);

    if (vidError || prodError) {
      toast.error("Failed to load data");
    } else {
      setVideos(vids || []);
      setProducts(prods || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !videoUrl) return toast.error("Please fill all fields");

    const { error } = await supabase.from("product_videos").insert({
      product_id: productId,
      video_url: videoUrl,
      is_featured: true
    });

    if (error) {
      toast.error("Failed to add video");
    } else {
      toast.success("Promo video added!");
      setProductId("");
      setVideoUrl("");
      setShowForm(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    const { error } = await supabase.from("product_videos").delete().eq("id", id);
    if (error) toast.error("Failed to delete video");
    else {
      toast.success("Video removed");
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Promo Videos</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus className="h-4 w-4" /> Add Video</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddVideo} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">New TikTok-Style Promo</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Select Product</label>
            <select 
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 outline-none focus:border-black"
            >
              <option value="">-- Choose Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Video URL (MP4)</label>
            <input 
              required
              type="url"
              placeholder="https://..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full border rounded-md px-3 py-2 outline-none focus:border-black"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
            Save Video
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
           <div className="col-span-full py-8 text-gray-500">Loading videos...</div>
        ) : videos.length === 0 ? (
           <div className="col-span-full py-8 text-gray-500 text-center bg-white rounded-xl border">No videos uploaded yet.</div>
        ) : (
          videos.map(video => (
            <div key={video.id} className="bg-white rounded-xl border overflow-hidden shadow-sm relative group">
              <div className="aspect-[9/16] bg-black relative">
                <video src={video.video_url} className="w-full h-full object-cover opacity-80" muted loop playsInline />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <VideoIcon className="h-10 w-10 text-white/50" />
                </div>
              </div>
              <div className="p-4">
                <p className="font-medium text-sm line-clamp-1 truncate">{video.products?.title}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">{video.view_count || 0} views</span>
                  <button 
                    onClick={() => handleDelete(video.id)}
                    className="text-red-500 p-1 hover:bg-red-50 rounded"
                    title="Delete Video"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
