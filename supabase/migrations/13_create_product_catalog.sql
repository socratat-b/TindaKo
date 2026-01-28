-- Migration: Create centralized product catalog table
-- Purpose: Shared reference catalog for quick product addition via barcode scanning
-- Note: This is separate from seller-specific products (which remain isolated)

CREATE TABLE product_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_name TEXT,  -- Generic category name (not FK to categories)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_product_catalog_barcode ON product_catalog(barcode);
CREATE INDEX idx_product_catalog_name ON product_catalog(name);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_product_catalog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_catalog_updated_at
  BEFORE UPDATE ON product_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_product_catalog_updated_at();

-- Allow public read access (catalog is shared reference data)
ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product catalog" ON product_catalog
  FOR SELECT
  USING (true);

-- Only admins can modify catalog (future feature)
-- For now, data will be managed via migrations/seeds

COMMENT ON TABLE product_catalog IS 'Centralized product reference catalog for barcode lookups. Shared across all users for quick product addition.';
COMMENT ON COLUMN product_catalog.barcode IS 'Unique product barcode (EAN, UPC, etc.)';
COMMENT ON COLUMN product_catalog.name IS 'Product name (common/generic name)';
COMMENT ON COLUMN product_catalog.category_name IS 'Generic category name (not linked to user categories)';
