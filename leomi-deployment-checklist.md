# Leomi E-commerce: Deployment & Launch Readiness Checklist

## 1. Environment & Database Verification
Before pointing your domain to the Vercel app, verify the following:

- [ ] **Supabase Production Provisioning:** Your production instance of Supabase is running with standard backups enabled.
- [ ] **Row Level Security (RLS) is Active:** Ensure RLS policies are enabled on all tables (`users`, `products`, `orders`, `product_videos`). *Do not launch with disabled RLS. Test this by trying to query via cURL as anonymous.*
- [ ] **Supabase Email Settings:** Update the `Site URL` in Supabase Auth -> URL Configuration to `https://leomi.com.np` so password resets and confirmation links redirect correctly.
- [ ] **API Keys Set:** Set your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` correctly in Vercel's Environment Variables.

## 2. SEO & Performance Config
- [ ] **Sitemap Validated:** Verify that `/sitemap.xml` generates successfully.
- [ ] **Robots.txt Checked:** Verify that `/robots.txt` generates and successfully hides `/admin/` and `/checkout/`.
- [ ] **Social Sharing Cards:** Try pasting your production URL into Twitter/Facebook/WhatsApp to verify the OpenGraph text and preview image load correctly.

## 3. Testing: E-commerce Core Flow
Run through a purchase on an Incognito tab (mobile view recommended):
- [ ] Add an item to the cart and view the cart. Ensure state persists if you refresh the browser page (Zustand LocalStorage persistence).
- [ ] Go to checkout, test **Cash on Delivery (COD)** checkout. Verify an order gets placed.
- [ ] *[Future]* Test eSewa checkout. Ensure the redirect to eSewa resolves safely back to `/payment-success` via your Webhooks/Success pages.
- [ ] Go to the Admin Dashboard as an Admin. See if the new order appeared.
- [ ] Move the order status from `pending` -> `shipped` -> `delivered`.
- [ ] Go back to products and verify the `stock_quantity` decremented accurately after checkout.

## 4. Testing: TikTok Feed & Multi-vendor Prep
- [ ] Open the mobile view and navigate to `/explore`.
- [ ] Verify videos auto-play when they scroll into view and pause when scrolling past.
- [ ] Go to Admin -> Settings and verify the "Enable Multi-Vendor Mode" toggle works. 

## 5. Deployment Step-By-Step (Vercel)
1. Commit all files to a public or private GitHub repository.
2. Go to **vercel.com** and click **"Add New..." > "Project"**.
3. Import your GitHub repository.
4. Open the **"Environment Variables"** dropdown during setup.
5. Paste in:
   - `NEXT_PUBLIC_APP_URL="https://leomi.com.np"`
   - `NEXT_PUBLIC_SUPABASE_URL="..."`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY="..."`
6. Click **Deploy**.

*Congratulations, Leomi is live!*
