-- V19: Fix Products Table Schema
-- Ensure products table has correct column names and structure

-- Check if 'name' column exists and rename it to 'title' if needed
SET @name_column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'name'
);

-- If 'name' column exists, rename it to 'title'
SET @sql = IF(@name_column_exists > 0,
    'ALTER TABLE products CHANGE COLUMN name title VARCHAR(255) NOT NULL',
    'SELECT "Column name does not exist, no action needed" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure all required columns exist with correct data types
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT 'Untitled Product',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'ACCESSORIES',
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS brand VARCHAR(255),
ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
ADD COLUMN IF NOT EXISTS rating DOUBLE DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS vendor_id BIGINT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add foreign key constraint for vendor_id if it doesn't exist
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'vendor_id'
    AND REFERENCED_TABLE_NAME = 'vendors'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE products ADD FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL',
    'SELECT "Foreign key constraint already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);

-- Remove default value from title column after ensuring it exists
ALTER TABLE products ALTER COLUMN title DROP DEFAULT;