-- ==========================================
-- LEOMI E-COMMERCE - SUPABASE SCHEMA
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUMS & TYPES
-- ==========================================
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
CREATE TYPE payment_method AS ENUM ('cod', 'esewa', 'khalti', 'bank_transfer');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- USERS TABLE (Extends Supabase Auth)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role user_role DEFAULT 'customer' NOT NULL,
    vendor_status TEXT DEFAULT 'pending', -- pending, approved, rejected, suspended
    commission_rate DECIMAL(5,2) DEFAULT 10.00, -- e.g., 10.00%
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE, -- Vital for Nepal e-commerce (COD verification)
    address JSONB, -- Storing full address details {province, district, city, street_mark}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES users(id) NOT NULL, -- Preparation for multi-vendor
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL, -- NPR pricing
    compare_at_price DECIMAL(10, 2), -- For discounts
    category TEXT NOT NULL,
    tags TEXT[], -- For trending, fast filters
    thumbnail_url TEXT,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT VIDEOS (TikTok/Reels style)
CREATE TABLE product_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_fee DECIMAL(10, 2) DEFAULT 0, -- Standard deliveries inside/outside Kathmandu
    status order_status DEFAULT 'pending',
    payment_method payment_method DEFAULT 'cod',
    payment_status payment_status DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    contact_phone TEXT NOT NULL, -- Fallback contact
    notes TEXT, -- User notes for delivery rider
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS TABLE
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    vendor_id UUID REFERENCES users(id), -- Vital for splitting vendor commissions later
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVENTORY LOGS (Audit trail for stock changes)
CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(id),
    change_amount INTEGER NOT NULL, -- e.g., +50 (restock), -2 (sold)
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX GIN_idx_products_tags ON products USING GIN(tags); 
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_product_videos_product_id ON product_videos(product_id);

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS: Users can view/edit their own profile. Admins can do all.
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (is_admin());

-- PRODUCTS: Anyone can view active products. Admins/Vendors can manage their own.
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (is_admin());

-- PRODUCT VIDEOS: Anyone can view. Admins can manage.
CREATE POLICY "Anyone can view product videos" ON product_videos FOR SELECT USING (true);
CREATE POLICY "Admins can manage product videos" ON product_videos FOR ALL USING (is_admin());

-- ORDERS: Customers can view/create own orders. Admins can view/update all.
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Customers can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (is_admin());

-- ORDER ITEMS: Customers view own. Admins view all.
CREATE POLICY "Customers can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Customers can create own order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON order_items FOR ALL USING (is_admin());

-- INVENTORY LOGS: Only Admins/Vendors can view.
CREATE POLICY "Admins can view inventory logs" ON inventory_logs FOR ALL USING (is_admin());

-- ==========================================
-- 5. FUNCTION & TRIGGERS
-- ==========================================
-- Trigger to automatically create a user record upon Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
