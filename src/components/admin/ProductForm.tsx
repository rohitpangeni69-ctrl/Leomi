"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  compare_at_price: z.coerce.number().optional(),
  category: z.string().min(2, "Category is required"),
  stock_quantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  is_active: z.boolean().default(true),
  thumbnail_url: z.string().url().optional().or(z.literal("")),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: any, 
  onSuccess?: () => void 
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      compare_at_price: initialData?.compare_at_price || 0,
      category: initialData?.category || "T-Shirts", // Default fallback
      stock_quantity: initialData?.stock_quantity || 0,
      is_active: initialData?.is_active ?? true,
      thumbnail_url: initialData?.thumbnail_url || "",
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      // Ensure we have a vendor_id, mock to own id for single-vendor start
      if (!user.user) throw new Error("Not authenticated");

      const payload = {
        ...data,
        vendor_id: user.user.id,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", initialData.id);
        
        if (error) throw error;
        toast.success("Product updated successfully!");
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
        toast.success("Product created successfully!");
        reset();
      }

      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Title</label>
          <input
            {...register("title")}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="e.g. Classic White T-Shirt"
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            {...register("description")}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500 min-h-[100px]"
            placeholder="Product details..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Price (NPR)</label>
          <input
            type="number"
            {...register("price")}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Compare At Price (NPR)</label>
          <input
            type="number"
            {...register("compare_at_price")}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <input
            {...register("category")}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="e.g. Hoodies, Pants"
          />
          {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Stock Quantity</label>
          <input
            type="number"
            {...register("stock_quantity")}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          {errors.stock_quantity && <p className="text-xs text-red-500">{errors.stock_quantity.message}</p>}
        </div>
        
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium">Thumbnail URL</label>
          <input
            {...register("thumbnail_url")}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center space-x-2 col-span-2">
          <input type="checkbox" id="is_active" {...register("is_active")} />
          <label htmlFor="is_active" className="text-sm font-medium">
            Active (visible to customers)
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading || isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {(loading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
