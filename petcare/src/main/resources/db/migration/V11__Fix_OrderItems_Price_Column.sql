-- V11: Fix OrderItems Price Column Issue
-- Fix the missing 'price' column issue in order_items table

-- Check if there's a 'price' column that shouldn't be there and remove it
-- Or add a default value if it's required

-- First, let's see the current structure and fix any issues
-- If there's an extra 'price' column, drop it
ALTER TABLE order_items DROP COLUMN IF EXISTS price;

-- Ensure the correct columns exist with proper constraints
ALTER TABLE order_items 
MODIFY COLUMN unit_price DECIMAL(10,2) NOT NULL,
MODIFY COLUMN total_price DECIMAL(10,2) NOT NULL;

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON order_items(created_at);