-- Add address column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;

-- Create index for address field (useful for searching)
CREATE INDEX IF NOT EXISTS idx_customers_address ON customers(address);
