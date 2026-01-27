-- Migration: Disable RLS for phone-based auth
-- Since we removed Supabase Auth and manually filter by store_phone in code

-- =====================================================
-- Disable RLS on all tables
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can access own store data" ON public.stores;
DROP POLICY IF EXISTS "Users can access own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can access own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can access own products" ON public.products;
DROP POLICY IF EXISTS "Users can access own sales" ON public.sales;
DROP POLICY IF EXISTS "Users can access own utang transactions" ON public.utang_transactions;
DROP POLICY IF EXISTS "Users can access own inventory movements" ON public.inventory_movements;

-- Disable RLS (no Supabase Auth, security via manual filtering)
ALTER TABLE public.stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.utang_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. RLS disabled since we removed Supabase Auth
-- 2. Data isolation enforced by manual .eq('store_phone', phone) filters in code
-- 3. Supabase used only for backup/restore, not primary database
-- 4. All operations go through IndexedDB first with manual filtering
