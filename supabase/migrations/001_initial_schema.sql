-- ============================================================
-- Sai Traders - Full Database Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Categories ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Products ─────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE stock_status_enum AS ENUM ('in_stock', 'out_of_stock');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


CREATE TABLE IF NOT EXISTS products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  category_id       UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  short_description TEXT,
  description       TEXT,
  price             NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  sale_price        NUMERIC(10, 2) CHECK (sale_price IS NULL OR sale_price < price),
  unit_label        TEXT NOT NULL DEFAULT '1 piece',
  stock_status      stock_status_enum NOT NULL DEFAULT 'in_stock',
  is_organic        BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  seo_title         TEXT,
  seo_description   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Product Images ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  alt_text    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- ─── Product Variants ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_variants (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  unit_label   TEXT NOT NULL,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  sale_price   NUMERIC(10, 2),
  stock_status stock_status_enum NOT NULL DEFAULT 'in_stock'
);

-- ─── Orders ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE order_status_enum AS ENUM ('new', 'confirmed', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_ref        TEXT UNIQUE NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  pincode          TEXT NOT NULL,
  landmark         TEXT,
  delivery_slot    TEXT NOT NULL,
  order_notes      TEXT,
  items            JSONB NOT NULL DEFAULT '[]',
  subtotal         NUMERIC(10, 2) NOT NULL,
  delivery_fee     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total            NUMERIC(10, 2) NOT NULL,
  status           order_status_enum NOT NULL DEFAULT 'new',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_ref ON orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Public can read active categories" ON categories;
DROP POLICY IF EXISTS "Public can read active products" ON products;
DROP POLICY IF EXISTS "Public can read product images of active products" ON product_images;
DROP POLICY IF EXISTS "Public can read variants of active products" ON product_variants;
DROP POLICY IF EXISTS "Authenticated admin can manage categories" ON categories;
DROP POLICY IF EXISTS "Authenticated admin can manage products" ON products;
DROP POLICY IF EXISTS "Authenticated admin can manage product images" ON product_images;
DROP POLICY IF EXISTS "Authenticated admin can manage product variants" ON product_variants;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Authenticated admin can view orders" ON orders;
DROP POLICY IF EXISTS "Authenticated admin can update orders" ON orders;

-- Public read access (only active records)
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public can read product images of active products"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND p.is_active = TRUE
    )
  );

CREATE POLICY "Public can read variants of active products"
  ON product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id AND p.is_active = TRUE
    )
  );

-- Admin full access (authenticated users or service role)
CREATE POLICY "Authenticated admin can manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admin can manage products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admin can manage product images"
  ON product_images FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admin can manage product variants"
  ON product_variants FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Orders: public can insert, admin can read/update
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated admin can view orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated admin can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ─── Storage Bucket ───────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Anyone or admin can upload product images" ON storage.objects;
CREATE POLICY "Anyone or admin can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Anyone or admin can update product images" ON storage.objects;
CREATE POLICY "Anyone or admin can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Anyone or admin can delete product images" ON storage.objects;
CREATE POLICY "Anyone or admin can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

-- ─── Seed Data ────────────────────────────────────────────────────────────────

-- Categories
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
  ('Fruits', 'fruits', 'Fresh seasonal fruits sourced directly from farmers. Rich in vitamins, minerals, and antioxidants for a healthy lifestyle.', 1, true),
  ('Vegetables', 'vegetables', 'Farm-fresh vegetables picked at peak ripeness. Packed with nutrients to keep your family healthy.', 2, true),
  ('Dairy', 'dairy', 'Pure and fresh dairy products from local farms. Pasteurized and packaged hygienically for your safety.', 3, true),
  ('Grains & Pulses', 'grains-pulses', 'Wholesome grains and protein-rich pulses. Staples of the Indian kitchen, sourced from trusted farmers.', 4, true),
  ('Dry Fruits & Nuts', 'dry-fruits-nuts', 'Premium quality dry fruits and nuts, naturally dried and packed fresh. Great for snacking and cooking.', 5, true),
  ('Beverages', 'beverages', 'Refreshing and healthy beverages including fresh juices, coconut water, herbal teas, and more.', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Products (24 sample products, 4 per category)
DO $$
DECLARE
  cat_fruits UUID;
  cat_vegetables UUID;
  cat_dairy UUID;
  cat_grains UUID;
  cat_dry_fruits UUID;
  cat_beverages UUID;
BEGIN
  SELECT id INTO cat_fruits FROM categories WHERE slug = 'fruits';
  SELECT id INTO cat_vegetables FROM categories WHERE slug = 'vegetables';
  SELECT id INTO cat_dairy FROM categories WHERE slug = 'dairy';
  SELECT id INTO cat_grains FROM categories WHERE slug = 'grains-pulses';
  SELECT id INTO cat_dry_fruits FROM categories WHERE slug = 'dry-fruits-nuts';
  SELECT id INTO cat_beverages FROM categories WHERE slug = 'beverages';

  -- Fruits
  INSERT INTO products (name, slug, category_id, short_description, price, sale_price, unit_label, stock_status, is_organic, is_featured, is_active) VALUES
    ('Alphonso Mangoes', 'alphonso-mangoes', cat_fruits, 'King of mangoes - sweet, rich, and aromatic GI-tagged Alphonso mangoes from Ratnagiri.', 450, 380, '1 dozen', 'in_stock', true, true, true),
    ('Royal Red Apples', 'royal-red-apples', cat_fruits, 'Crisp and sweet Himachali apples, hand-picked from the orchards of Shimla.', 180, NULL, '1 kg', 'in_stock', false, false, true),
    ('Seedless Green Grapes', 'seedless-green-grapes', cat_fruits, 'Juicy and sweet Thompson seedless grapes, perfect for snacking.', 120, 99, '500 g', 'in_stock', true, false, true),
    ('Pomegranate', 'pomegranate', cat_fruits, 'Ruby red pomegranates packed with antioxidants, sourced from Solapur farms.', 199, NULL, '2 pieces', 'in_stock', false, true, true),

    -- Vegetables
    ('Organic Tomatoes', 'organic-tomatoes', cat_vegetables, 'Vine-ripened organic tomatoes, no pesticides, naturally sweet and flavorful.', 60, NULL, '1 kg', 'in_stock', true, true, true),
    ('Baby Spinach', 'baby-spinach', cat_vegetables, 'Tender baby spinach leaves, washed and ready to use. Packed with iron and vitamins.', 45, 35, '200 g', 'in_stock', true, false, true),
    ('Broccoli', 'broccoli', cat_vegetables, 'Fresh green broccoli florets, rich in fiber and vitamins C and K.', 80, NULL, '500 g', 'in_stock', false, false, true),
    ('Carrots', 'carrots', cat_vegetables, 'Crunchy and sweet carrots straight from the farm. Rich in beta-carotene.', 40, NULL, '500 g', 'out_of_stock', true, false, true),

    -- Dairy
    ('Full Cream Milk', 'full-cream-milk', cat_dairy, 'Farm-fresh full cream milk, pasteurized and packed within hours of milking.', 68, NULL, '1 litre', 'in_stock', false, true, true),
    ('Desi Ghee', 'desi-ghee', cat_dairy, 'Pure cow ghee made by traditional bilona method. Rich aroma and golden color.', 650, 580, '500 ml', 'in_stock', true, true, true),
    ('Greek Yogurt', 'greek-yogurt', cat_dairy, 'Thick and creamy Greek-style yogurt, high in protein and probiotics.', 120, NULL, '400 g', 'in_stock', false, false, true),
    ('Paneer', 'paneer', cat_dairy, 'Soft and fresh cottage cheese made from whole milk. Perfect for curries and grills.', 90, NULL, '200 g', 'in_stock', false, false, true),

    -- Grains & Pulses
    ('Basmati Rice', 'basmati-rice', cat_grains, 'Premium aged Basmati rice with long grains and rich aroma. From the foothills of Himalayas.', 280, 249, '2 kg', 'in_stock', false, true, true),
    ('Toor Dal', 'toor-dal', cat_grains, 'Yellow split pigeon peas - the staple of Indian cooking. High in protein and fiber.', 140, NULL, '1 kg', 'in_stock', false, false, true),
    ('Organic Wheat Flour', 'organic-wheat-flour', cat_grains, 'Stone-ground whole wheat flour from organically grown wheat. Perfect for rotis and chapatis.', 85, NULL, '1 kg', 'in_stock', true, false, true),
    ('Black Chickpeas', 'black-chickpeas', cat_grains, 'Desi kala chana - earthy and nutritious. High in protein, great for salads and curries.', 110, 95, '1 kg', 'in_stock', false, false, true),

    -- Dry Fruits & Nuts
    ('California Almonds', 'california-almonds', cat_dry_fruits, 'Premium California almonds, rich in healthy fats, protein, and vitamin E.', 899, 749, '500 g', 'in_stock', false, true, true),
    ('Cashew W240', 'cashew-w240', cat_dry_fruits, 'Whole cashews Grade W240, creamy and crunchy. Perfect for snacking and cooking.', 750, NULL, '250 g', 'in_stock', false, false, true),
    ('Medjool Dates', 'medjool-dates', cat_dry_fruits, 'Soft and caramel-sweet Medjool dates. Naturally sweet, a great sugar substitute.', 499, 429, '500 g', 'in_stock', true, false, true),
    ('Organic Raisins', 'organic-raisins', cat_dry_fruits, 'Plump and sweet organic raisins, sundried and preservative-free.', 199, NULL, '200 g', 'in_stock', true, false, true),

    -- Beverages
    ('Cold-Pressed Orange Juice', 'cold-pressed-orange-juice', cat_beverages, 'Freshly cold-pressed 100% orange juice, no added sugar or preservatives.', 149, 129, '500 ml', 'in_stock', true, true, true),
    ('Coconut Water', 'coconut-water', cat_beverages, 'Fresh tender coconut water, naturally isotonic and packed with electrolytes.', 80, NULL, '1 piece', 'in_stock', false, false, true),
    ('Tulsi Green Tea', 'tulsi-green-tea', cat_beverages, 'Aromatic blend of green tea with tulsi (holy basil), rich in antioxidants.', 299, 249, '100 g (50 cups)', 'in_stock', true, false, true),
    ('Sugarcane Juice', 'sugarcane-juice', cat_beverages, 'Fresh pressed sugarcane juice with ginger and lemon. Natural energy booster.', 60, NULL, '350 ml', 'out_of_stock', false, false, true)
  ON CONFLICT (slug) DO NOTHING;

END $$;
