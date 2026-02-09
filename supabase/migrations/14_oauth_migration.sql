-- Migration: OAuth Authentication with Supabase Auth
-- Replaces phone-based auth with Google OAuth + Email/Password
-- Changes: store_phone (text) → user_id (uuid)

-- ============================================================================
-- STEP 1: Drop all existing tables (user confirmed dummy data)
-- ============================================================================

DROP TABLE IF EXISTS public.inventory_movements CASCADE;
DROP TABLE IF EXISTS public.utang_transactions CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.stores CASCADE;

-- ============================================================================
-- STEP 2: Create stores table (user profiles from OAuth)
-- ============================================================================

CREATE TABLE public.stores (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  store_name text NOT NULL,
  avatar_url text,
  provider text NOT NULL CHECK (provider IN ('google', 'email')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON public.stores FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.stores FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.stores FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 3: Create data tables with user_id (UUID) foreign key
-- ============================================================================

-- Categories
CREATE TABLE public.categories (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  synced_at timestamptz,
  is_deleted boolean DEFAULT false NOT NULL
);

-- Customers
CREATE TABLE public.customers (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  address text,
  total_utang numeric(10, 2) DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  synced_at timestamptz,
  is_deleted boolean DEFAULT false NOT NULL
);

-- Products
CREATE TABLE public.products (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  barcode text,
  category_id text NOT NULL,
  selling_price numeric(10, 2) NOT NULL,
  stock_qty integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  synced_at timestamptz,
  is_deleted boolean DEFAULT false NOT NULL
);

-- Sales
CREATE TABLE public.sales (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  items jsonb NOT NULL,
  subtotal numeric(10, 2) NOT NULL,
  discount numeric(10, 2) DEFAULT 0 NOT NULL,
  total numeric(10, 2) NOT NULL,
  amount_paid numeric(10, 2) NOT NULL,
  change numeric(10, 2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'gcash', 'utang')),
  customer_id text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  synced_at timestamptz,
  is_deleted boolean DEFAULT false NOT NULL
);

-- Utang Transactions
CREATE TABLE public.utang_transactions (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id text NOT NULL,
  sale_id text,
  type text NOT NULL CHECK (type IN ('charge', 'payment')),
  amount numeric(10, 2) NOT NULL,
  balance_after numeric(10, 2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  synced_at timestamptz,
  is_deleted boolean DEFAULT false NOT NULL
);

-- Inventory Movements
CREATE TABLE public.inventory_movements (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('in', 'out', 'adjust')),
  qty integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  synced_at timestamptz,
  is_deleted boolean DEFAULT false NOT NULL
);

-- ============================================================================
-- STEP 4: Enable RLS on all data tables
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utang_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Create RLS policies (automatic user isolation)
-- ============================================================================

-- Categories
CREATE POLICY "Users can view own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- Customers
CREATE POLICY "Users can view own customers"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON public.customers FOR DELETE
  USING (auth.uid() = user_id);

-- Products
CREATE POLICY "Users can view own products"
  ON public.products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE
  USING (auth.uid() = user_id);

-- Sales
CREATE POLICY "Users can view own sales"
  ON public.sales FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON public.sales FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales"
  ON public.sales FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
  ON public.sales FOR DELETE
  USING (auth.uid() = user_id);

-- Utang Transactions
CREATE POLICY "Users can view own utang_transactions"
  ON public.utang_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own utang_transactions"
  ON public.utang_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own utang_transactions"
  ON public.utang_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own utang_transactions"
  ON public.utang_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Inventory Movements
CREATE POLICY "Users can view own inventory_movements"
  ON public.inventory_movements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory_movements"
  ON public.inventory_movements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory_movements"
  ON public.inventory_movements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory_movements"
  ON public.inventory_movements FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: Create indexes for performance
-- ============================================================================

-- User isolation indexes (most important - used in every query)
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_sales_user_id ON public.sales(user_id);
CREATE INDEX idx_utang_transactions_user_id ON public.utang_transactions(user_id);
CREATE INDEX idx_inventory_movements_user_id ON public.inventory_movements(user_id);

-- Sync indexes
CREATE INDEX idx_categories_synced_at ON public.categories(user_id, synced_at);
CREATE INDEX idx_customers_synced_at ON public.customers(user_id, synced_at);
CREATE INDEX idx_products_synced_at ON public.products(user_id, synced_at);
CREATE INDEX idx_sales_synced_at ON public.sales(user_id, synced_at);
CREATE INDEX idx_utang_transactions_synced_at ON public.utang_transactions(user_id, synced_at);
CREATE INDEX idx_inventory_movements_synced_at ON public.inventory_movements(user_id, synced_at);

-- Query optimization indexes
CREATE INDEX idx_products_category_id ON public.products(user_id, category_id);
CREATE INDEX idx_products_barcode ON public.products(user_id, barcode);
CREATE INDEX idx_sales_created_at ON public.sales(user_id, created_at DESC);
CREATE INDEX idx_utang_transactions_customer_id ON public.utang_transactions(user_id, customer_id);
CREATE INDEX idx_inventory_movements_product_id ON public.inventory_movements(user_id, product_id);

-- ============================================================================
-- STEP 7: Create updated_at triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_utang_transactions_updated_at
  BEFORE UPDATE ON public.utang_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_movements_updated_at
  BEFORE UPDATE ON public.inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
