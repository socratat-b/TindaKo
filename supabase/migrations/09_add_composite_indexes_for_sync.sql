-- Add composite indexes on (user_id, is_deleted) for faster pull queries
-- These optimize queries like: WHERE user_id = ? AND is_deleted = false

-- Categories: pull query filters by user_id + is_deleted
CREATE INDEX IF NOT EXISTS idx_categories_user_id_is_deleted
ON categories (user_id, is_deleted);

-- Customers: pull query filters by user_id + is_deleted
CREATE INDEX IF NOT EXISTS idx_customers_user_id_is_deleted
ON customers (user_id, is_deleted);

-- Products: pull query filters by user_id + is_deleted
CREATE INDEX IF NOT EXISTS idx_products_user_id_is_deleted
ON products (user_id, is_deleted);

-- Sales: pull query filters by user_id + is_deleted
CREATE INDEX IF NOT EXISTS idx_sales_user_id_is_deleted
ON sales (user_id, is_deleted);

-- Utang Transactions: pull query filters by user_id + is_deleted
CREATE INDEX IF NOT EXISTS idx_utang_transactions_user_id_is_deleted
ON utang_transactions (user_id, is_deleted);

-- Inventory Movements: pull query filters by user_id + is_deleted
CREATE INDEX IF NOT EXISTS idx_inventory_movements_user_id_is_deleted
ON inventory_movements (user_id, is_deleted);

-- Additional composite index for push queries (synced_at IS NULL)
-- This optimizes queries like: WHERE user_id = ? AND synced_at IS NULL
CREATE INDEX IF NOT EXISTS idx_categories_user_id_synced_at
ON categories (user_id, synced_at) WHERE synced_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_customers_user_id_synced_at
ON customers (user_id, synced_at) WHERE synced_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_user_id_synced_at
ON products (user_id, synced_at) WHERE synced_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sales_user_id_synced_at
ON sales (user_id, synced_at) WHERE synced_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_utang_transactions_user_id_synced_at
ON utang_transactions (user_id, synced_at) WHERE synced_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_movements_user_id_synced_at
ON inventory_movements (user_id, synced_at) WHERE synced_at IS NULL;
