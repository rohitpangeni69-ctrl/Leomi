# Leomi E-commerce: Next.js + Supabase Setup Guide

This guide contains the exact steps and commands to set up your Next.js 14 project, integrate shadcn/ui, and configure Supabase based on the Leomi requirements.

## 1. Next.js Initialization
Run these commands in your terminal to spin up the fundamental Next.js App Router structure.

```bash
# Initialize Next.js 14 project with TypeScript, Tailwind CSS, and App Router
npx create-next-app@14 leomi-ecommerce --typescript --tailwind --eslint --app

# Navigate into the project
cd leomi-ecommerce

# Initialize shadcn/ui
npx shadcn-ui@latest init
# (Choose default options: New York style, Slate color, css variables: yes, etc.)

# Install required core packages for Supabase, Forms, and validation
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react date-fns

# Add initial shadcn components you will likely need
npx shadcn-ui@latest add button card input label form toast select table dialog sheet avatar
```

## 2. Recommended Project File Structure
For a scalable, multi-vendor ready infrastructure, structure your `src/` or top-level `/app` directory as follows:

```
leomi-ecommerce/
âââ app/                    # Next.js App Router
â   âââ (customer)/         # Customer-facing routes (shop, cart, checkout)
â   â   âââ page.tsx        # Homepage (TikTok style feed placeholder)
â   â   âââ product/[slug]/ # Product details
â   â   â”ââ checkout/       # Checkout flow
â   âââ (auth)/             # Authentication routes
â   â   âââ login/
â   â   â”ââ register/
â   âââ (admin)/            # Admin Dashboard routes
â   â   âââ dashboard/      # Analytics, Sales
â   â   âââ products/       # Manage products & videos
â   â   â”ââ orders/         # Order processing
â   âââ api/                # API Routes (Payment Webhooks, etc.)
â   â”ââ layout.tsx          # Root Layout
âââ components/             # Reusable UI
â   âââ ui/                 # shadcn components
â   âââ video-feed/         # TikTok style video scroller components
â   â”ââ layout/             # Navbar, Footer, Sidebar
âââ lib/                    # Supabase config, utilities, type definitions
â   âââ supabase/           # Browser & Server Supabase clients
â   âââ zod/                # Form validation schemas
â   â”ââ utils.ts            # shadcn cn() utility
â”ââ types/                  # TypeScript interface definitions (Database types)
```

## 3. Supabase Setup Steps

1. **Create Project**: Go to [Supabase](https://supabase.com), create a new project named "Leomi".
2. **Execute Schema**: Go to the **SQL Editor** in the Supabase Dashboard. Note the file `supabase-schema.sql` located alongside this README. Copy the contents of `supabase-schema.sql` and run it in the SQL Editor. 
3. **Storage Buckets**: Go to **Storage** in the Supabase Dashboard. Create two buckets:
   - `avatars` (Public bucket)
   - `product-media` (Public bucket) - Used for images and promo videos.
4. **Environment Variables**: Go to **Project Settings > API**. Copy the `URL` and `anon key`. Rename `.env.local.template` to `.env.local` and paste these values inside.
5. **Types Generation (Optional but Recommended)**: Generate TS types from your DB schema using the Supabase CLI:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
   ```

## 4. Next Step Prompt

Whenever you're ready to proceed to building out the platform, copy and paste the following prompt back to me:

> **"Great, the Next.js foundation and Supabase DB are set up. Let's build the Admin Dashboard foundation. I need:
> 1. A protected `(admin)/layout.tsx` with a responsive sidebar (using lucide-react icons).
> 2. The Next.js middleware (`middleware.ts`) to ensure only users with the `admin` role can access `/dashboard` routes, and redirect unauthenticated users to `/login`.
> 3. A reusable `ProductForm` component using `react-hook-form` + `zod` to add new products to the database, including fields for Name, Price, Description, Category, and Stock."**
