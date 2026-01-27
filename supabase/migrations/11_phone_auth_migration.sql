-- Migration: Phone-based authentication
-- Replace Supabase Auth with custom phone + PIN system
-- Changes userId to storePhone across all tables

-- =====================================================
-- 1. Create stores table (auth table)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL CHECK (phone ~ '^09[0-9]{9}$'), -- Philippine phone format
  store_name text NOT NULL,
  pin_hash text NOT NULL, -- bcrypt hash
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Index for fast phone lookups
CREATE INDEX IF NOT EXISTS idx_stores_phone ON public.stores(phone);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own store data
CREATE POLICY "Users can access own store data"
  ON public.stores
  FOR ALL
  USING (phone = current_setting('app.current_phone', true));

-- =====================================================
-- 2. Add store_phone column to all data tables
-- =====================================================

-- Categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS store_phone text REFERENCES public.stores(phone) ON DELETE CASCADE;

-- Customers
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS store_phone text REFERENCES public.stores(phone) ON DELETE CASCADE;

-- Products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS store_phone text REFERENCES public.stores(phone) ON DELETE CASCADE;

-- Sales
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS store_phone text REFERENCES public.stores(phone) ON DELETE CASCADE;

-- Utang Transactions
ALTER TABLE public.utang_transactions
  ADD COLUMN IF NOT EXISTS store_phone text REFERENCES public.stores(phone) ON DELETE CASCADE;

-- Inventory Movements
ALTER TABLE public.inventory_movements
  ADD COLUMN IF NOT EXISTS store_phone text REFERENCES public.stores(phone) ON DELETE CASCADE;

-- =====================================================
-- 3. Create indexes on store_phone for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_categories_store_phone ON public.categories(store_phone);
CREATE INDEX IF NOT EXISTS idx_customers_store_phone ON public.customers(store_phone);
CREATE INDEX IF NOT EXISTS idx_products_store_phone ON public.products(store_phone);
CREATE INDEX IF NOT EXISTS idx_sales_store_phone ON public.sales(store_phone);
CREATE INDEX IF NOT EXISTS idx_utang_transactions_store_phone ON public.utang_transactions(store_phone);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_store_phone ON public.inventory_movements(store_phone);

-- =====================================================
-- 4. Update RLS policies to use store_phone
-- =====================================================

-- Drop old policies (if they exist)
DROP POLICY IF EXISTS "Users can access own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can access own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can access own products" ON public.products;
DROP POLICY IF EXISTS "Users can access own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can access own utang transactions" ON public.utang_transactions;
DROP POLICY IF EXISTS "Users can access own inventory movements" ON public.inventory_movements;

-- Create new phone-based policies
CREATE POLICY "Users can access own categories"
  ON public.categories
  FOR ALL
  USING (store_phone = current_setting('app.current_phone', true));

CREATE POLICY "Users can access own customers"
  ON public.customers
  FOR ALL
  USING (store_phone = current_setting('app.current_phone', true));

CREATE POLICY "Users can access own products"
  ON public.products
  FOR ALL
  USING (store_phone = current_setting('app.current_phone', true));

CREATE POLICY "Users can access own sales"
  ON public.sales
  FOR ALL
  USING (store_phone = current_setting('app.current_phone', true));

CREATE POLICY "Users can access own utang transactions"
  ON public.utang_transactions
  FOR ALL
  USING (store_phone = current_setting('app.current_phone', true));

CREATE POLICY "Users can access own inventory movements"
  ON public.inventory_movements
  FOR ALL
  USING (store_phone = current_setting('app.current_phone', true));

-- =====================================================
-- 5. Update timestamp triggers
-- =====================================================

-- Add trigger for stores table updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Old user_id columns are kept for backward compatibility
--    They can be dropped later after confirming the migration works
--
-- 2. To use this auth system, clients must:
--    - Set current_phone before queries: SET LOCAL app.current_phone = '09171234567'
--    - Or filter manually: WHERE store_phone = '09171234567'
--
-- 3. No SMS verification - phone is just a unique identifier
--
-- 4. Migration clears existing data in local IndexedDB
--    Supabase data persists but won't be accessible without migration
