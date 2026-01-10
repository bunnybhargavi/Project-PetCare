-- V10: Fix Order Status Column Size
-- Fix the status column size issue that's causing checkout failures

-- Increase the size of the status column to accommodate all enum values
ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';

-- Also increase payment_status column size for consistency
ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(50) DEFAULT 'PENDING';

-- Add index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);