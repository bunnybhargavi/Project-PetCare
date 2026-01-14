-- V21: Fix Cart Items Table Schema
-- Add missing columns and fix data types

-- Ensure cart_items table has all required columns
ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Remove 'price' column if it exists (we use 'unit_price' instead)
SET @sql = (
    SELECT CASE 
        WHEN COUNT(*) > 0 THEN 'ALTER TABLE cart_items DROP COLUMN price;'
        ELSE 'SELECT "price column does not exist" as message;'
    END
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'cart_items' 
    AND COLUMN_NAME = 'price'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update any NULL values
UPDATE cart_items SET unit_price = 0.00 WHERE unit_price IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_created_at ON cart_items(created_at);