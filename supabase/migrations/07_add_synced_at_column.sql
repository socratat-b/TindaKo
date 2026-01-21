-- Add synced_at column to all tables for sync tracking
-- This column tracks when data was last synced to Supabase (null = needs sync)

ALTER TABLE categories ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
ALTER TABLE utang_transactions ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ;

-- Create indexes for faster sync queries (filter by null synced_at)
CREATE INDEX IF NOT EXISTS idx_categories_synced_at ON categories(synced_at);
CREATE INDEX IF NOT EXISTS idx_customers_synced_at ON customers(synced_at);
CREATE INDEX IF NOT EXISTS idx_products_synced_at ON products(synced_at);
CREATE INDEX IF NOT EXISTS idx_sales_synced_at ON sales(synced_at);
CREATE INDEX IF NOT EXISTS idx_utang_transactions_synced_at ON utang_transactions(synced_at);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_synced_at ON inventory_movements(synced_at);
