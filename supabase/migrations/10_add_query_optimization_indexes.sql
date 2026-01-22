-- Additional indexes based on common query patterns in the application

-- Products: Filter by category (very common in UI)
-- Optimizes: WHERE category_id = ? AND is_deleted = false
CREATE INDEX IF NOT EXISTS idx_products_category_id_is_deleted
ON products (category_id, is_deleted);

-- Sales: Filter by customer (utang tracking, customer history)
-- Optimizes: WHERE customer_id = ? AND is_deleted = false
CREATE INDEX IF NOT EXISTS idx_sales_customer_id_is_deleted
ON sales (customer_id, is_deleted) WHERE customer_id IS NOT NULL;

-- Sales: Filter by date range (reports page - most common query)
-- Optimizes: WHERE user_id = ? AND is_deleted = false AND created_at BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_sales_user_id_is_deleted_created_at
ON sales (user_id, is_deleted, created_at DESC);

-- Utang Transactions: Filter by customer (customer transaction history)
-- Optimizes: WHERE customer_id = ? AND user_id = ? AND is_deleted = false
CREATE INDEX IF NOT EXISTS idx_utang_transactions_customer_id_is_deleted
ON utang_transactions (customer_id, is_deleted);

-- Utang Transactions: Date-based reporting
-- Optimizes: WHERE user_id = ? AND created_at BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_utang_transactions_user_id_created_at
ON utang_transactions (user_id, created_at DESC);

-- Inventory Movements: Filter by product (product history)
-- Optimizes: WHERE product_id = ? AND user_id = ? AND is_deleted = false
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id_is_deleted
ON inventory_movements (product_id, is_deleted);

-- Inventory Movements: Date-based reporting
-- Optimizes: WHERE user_id = ? AND created_at BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_inventory_movements_user_id_created_at
ON inventory_movements (user_id, created_at DESC);
