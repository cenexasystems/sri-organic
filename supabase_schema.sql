-- ============================================================
-- ROOT-N-GRAIN / SRI ORGANIC — SUPABASE SQL SCHEMA
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES (Users / Admin accounts)
--    Linked to Supabase Auth via auth.users(id)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT NOT NULL DEFAULT '',
  mobile      TEXT DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'Customer' CHECK (role IN ('Admin', 'Customer')),
  joined_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────
-- 2. CATEGORIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default categories
INSERT INTO categories (name) VALUES ('Hair Care') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Skin Care') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Nutrition') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Pooja Items') ON CONFLICT (name) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 3. PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                TEXT PRIMARY KEY,                    -- slug e.g. "mahizham-hair-oil"
  name              TEXT NOT NULL,
  category          TEXT NOT NULL REFERENCES categories(name) ON UPDATE CASCADE,
  description       TEXT NOT NULL DEFAULT '',
  image             TEXT DEFAULT '',                      -- URL from Supabase Storage
  herbs             TEXT DEFAULT '',                      -- comma-separated or free text
  benefits          TEXT[] DEFAULT '{}',                  -- array of benefit strings
  is_available      BOOLEAN NOT NULL DEFAULT true,
  details           TEXT DEFAULT '',                      -- detailed product description
  how_to_use        TEXT DEFAULT '',
  tamil_name        TEXT DEFAULT '',
  nutritional_info  JSONB DEFAULT NULL,                   -- [{label, value}, ...]
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available);


-- ─────────────────────────────────────────────────────────────
-- 4. PRODUCT SIZES (variants per product)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_sizes (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size          TEXT NOT NULL,                            -- e.g. "100ml", "250g"
  price         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_available  BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT NOT NULL DEFAULT 0                    -- for display ordering
);

CREATE INDEX idx_product_sizes_product ON product_sizes(product_id);


-- ─────────────────────────────────────────────────────────────
-- 5. COUPONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  code         TEXT PRIMARY KEY,                          -- e.g. "WELCOME", "SAVE10"
  discount     NUMERIC(5, 2) NOT NULL DEFAULT 0,         -- percentage discount
  min_order    NUMERIC(10, 2) NOT NULL DEFAULT 0,        -- minimum order value
  expiry_date  DATE DEFAULT NULL,                        -- NULL = no expiry
  usage_limit  INT NOT NULL DEFAULT 0,                   -- 0 = unlimited
  used_count   INT NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default coupons from the admin page
INSERT INTO coupons (code, discount, min_order, expiry_date, usage_limit, used_count, status) VALUES ('VILLAGES', 15, 1, '2026-06-19', 20, 0, 'ACTIVE') ON CONFLICT (code) DO NOTHING;
INSERT INTO coupons (code, discount, min_order, expiry_date, usage_limit, used_count, status) VALUES ('MNMKL', 10, 1, '2026-07-31', 100, 0, 'ACTIVE') ON CONFLICT (code) DO NOTHING;
INSERT INTO coupons (code, discount, min_order, expiry_date, usage_limit, used_count, status) VALUES ('WELCOME', 10, 10, '2026-12-31', 50, 1, 'ACTIVE') ON CONFLICT (code) DO NOTHING;
INSERT INTO coupons (code, discount, min_order, expiry_date, usage_limit, used_count, status) VALUES ('SAVE10', 10, 1, NULL, 0, 0, 'ACTIVE') ON CONFLICT (code) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 6. ORDERS (POS Bills — INV-* / POS-*)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,                     -- e.g. "INV-2026-AB1CD2E"
  customer_name    TEXT NOT NULL DEFAULT 'Walk-in Customer',
  customer_phone   TEXT NOT NULL DEFAULT '',
  customer_email   TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  source           TEXT NOT NULL DEFAULT 'OFFLINE' CHECK (source IN ('OFFLINE', 'ONLINE', 'MANUAL')),
  subtotal         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_price      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Cancelled')),
  coupon_code      TEXT DEFAULT NULL,                    -- references coupons.code (soft ref)
  coupon_discount  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  manual_discount  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_charge  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cash_received    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  change_returned  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_source ON orders(source);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);


-- ─────────────────────────────────────────────────────────────
-- 7. ORDER ITEMS (line items per order)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT DEFAULT 'catalog',                    -- 'custom' for manual items, 'catalog' for catalog
  name        TEXT NOT NULL,
  size        TEXT DEFAULT '—',
  quantity    INT NOT NULL DEFAULT 1,
  price       NUMERIC(10, 2) NOT NULL DEFAULT 0          -- unit price at time of sale
);

CREATE INDEX idx_order_items_order ON order_items(order_id);


-- ─────────────────────────────────────────────────────────────
-- 8. WHATSAPP REQUESTS (storefront ORD-* orders)
--    Separate table from POS orders — these come from the
--    customer-facing storefront and are tracked differently.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_requests (
  id               TEXT PRIMARY KEY DEFAULT ('ORD-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0')),
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_email   TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  total_price      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Completed', 'Cancelled')),
  items            JSONB NOT NULL DEFAULT '[]',          -- [{productId, name, size, quantity, price}]
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatsapp_status ON whatsapp_requests(status);
CREATE INDEX idx_whatsapp_created ON whatsapp_requests(created_at DESC);


-- ─────────────────────────────────────────────────────────────
-- 9. UPDATED_AT AUTO-TRIGGER
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['profiles', 'products', 'coupons', 'orders', 'whatsapp_requests'])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- 10. STORAGE BUCKET (for product images)
-- ─────────────────────────────────────────────────────────────
-- Run this in the SQL editor — it creates a public bucket for
-- product images that the admin can upload to.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 11. ROW-LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_requests ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read own profile; Admins can read/update all
CREATE POLICY "Users can view own profile"      ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"    ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"    ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "Admins can update all profiles"  ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- CATEGORIES: Public read; Admin write
CREATE POLICY "Anyone can view categories"      ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories"    ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- PRODUCTS & SIZES: Public read; Admin write
CREATE POLICY "Anyone can view products"        ON products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products"      ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "Anyone can view product sizes"   ON product_sizes FOR SELECT USING (true);
CREATE POLICY "Admins can manage product sizes" ON product_sizes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- COUPONS: Public read (storefront needs to validate); Admin write
CREATE POLICY "Anyone can view coupons"         ON coupons FOR SELECT USING (true);
CREATE POLICY "Admins can manage coupons"       ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- ORDERS & ITEMS: Admin full access
CREATE POLICY "Admins can manage orders"        ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);
CREATE POLICY "Admins can manage order items"   ON order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- WHATSAPP REQUESTS: Customers can insert; Admins can read/update
CREATE POLICY "Anyone can create requests"      ON whatsapp_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage requests"      ON whatsapp_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- STORAGE: Public read for product images; Admin upload
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
  );

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
  );
