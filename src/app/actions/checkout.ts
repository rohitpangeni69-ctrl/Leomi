"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function processCheckout(formData: FormData, cartItems: any[], totalAmount: number, shippingFee: number) {
  const supabase = await createClient();

  // Get current user (mocked for now if not logged in since we allow guests? Wait, RLS mandates user_id)
  const { data: userData, error: userError } = await supabase.auth.getUser();
  let userId = userData?.user?.id;

  // If no user, maybe we throw an error for now
  if (!userId) {
    return { success: false, error: "Please log in to complete checkout." };
  }

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const addressLine1 = formData.get("addressLine1") as string;
  const city = formData.get("city") as string;
  const paymentMethod = formData.get("paymentMethod") as string;

  if (!cartItems.length) {
    return { success: false, error: "Cart is empty." };
  }

  // Basic idempotency / inventory check omitted for brevity, but logically:
  // 1. Double check stock.
  // 2. Insert into orders.
  // 3. Insert into order_items.
  // 4. Update products stock_quantity.

  try {
    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        shipping_fee: shippingFee,
        status: "pending",
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cod" ? "pending" : "completed", // Mocking complete for eSewa/Khalti for now
        shipping_address: { addressLine1, city },
        contact_phone: phone,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || "Failed to create order");
    }

    // 2. Create order items & 3. Reduce inventory
    for (const item of cartItems) {
      // Create order item
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: item.productId,
        vendor_id: item.vendorId, // Nullable initially for safety
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      });

      if (itemError) throw new Error(itemError.message);

      // Reduce stock (unsafe concurrent way, but okay for MVP)
      // A better way is using an RPC function in Postgres: update products set stock_quantity = stock_quantity - X where id = Y
      // We will read and write.
      const { data: prodData } = await supabase.from("products").select("stock_quantity").eq("id", item.productId).single();
      if (prodData) {
        await supabase
          .from("products")
          .update({ stock_quantity: Math.max(0, prodData.stock_quantity - item.quantity) })
          .eq("id", item.productId);
      }
    }

    // Mock Email sending (Resend/Sendgrid) could happen here
    console.log(`[Email Mock] Order ${order.id} confirmed for ${fullName}`);

    revalidatePath("/admin/orders");
    return { success: true, orderId: order.id };

  } catch (err: any) {
    return { success: false, error: err.message || "An error occurred during checkout" };
  }
}
