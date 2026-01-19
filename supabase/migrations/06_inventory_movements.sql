-- Create inventory_movements table
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjust')),
  qty INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_inventory_movements_user_id ON inventory_movements(user_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(type);

-- Enable RLS
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage own inventory_movements"
  ON inventory_movements FOR ALL
  USING (auth.uid() = user_id);

-- Updated trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
