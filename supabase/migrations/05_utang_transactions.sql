-- Create utang_transactions table
CREATE TABLE utang_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  sale_id UUID REFERENCES sales(id),
  type TEXT NOT NULL CHECK (type IN ('charge', 'payment')),
  amount NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_utang_transactions_user_id ON utang_transactions(user_id);
CREATE INDEX idx_utang_transactions_created_at ON utang_transactions(created_at);
CREATE INDEX idx_utang_transactions_customer_id ON utang_transactions(customer_id);
CREATE INDEX idx_utang_transactions_sale_id ON utang_transactions(sale_id);

-- Enable RLS
ALTER TABLE utang_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage own utang_transactions"
  ON utang_transactions FOR ALL
  USING (auth.uid() = user_id);

-- Updated trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON utang_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
