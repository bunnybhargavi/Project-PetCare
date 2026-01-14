-- V20: Comprehensive Schema Fix for All Issues
-- This migration fixes all database schema issues identified

-- 1. Ensure products table has correct structure
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

-- 2. Remove any problematic columns that might exist
SET @sql = (
    SELECT CASE 
        WHEN COUNT(*) > 0 THEN 'ALTER TABLE products DROP COLUMN name;'
        ELSE 'SELECT "name column does not exist" as message;'
    END
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'name'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
    SELECT CASE 
        WHEN COUNT(*) > 0 THEN 'ALTER TABLE products DROP COLUMN quantity;'
        ELSE 'SELECT "quantity column does not exist" as message;'
    END
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'quantity'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Ensure users table has profile_photo column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500);

-- 4. Ensure orders table has all required columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tax DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS payment_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paypal_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. Ensure appointments table has all required columns
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS clinic_address TEXT,
ADD COLUMN IF NOT EXISTS parking_info TEXT,
ADD COLUMN IF NOT EXISTS directions_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS prescription TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 30;

-- 6. Add foreign key constraints if they don't exist
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

-- 7. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_appointments_pet ON appointments(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet ON appointments(veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

-- 8. Add unique constraints where needed
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'orders'
    AND CONSTRAINT_NAME = 'uk_order_number'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE orders ADD CONSTRAINT uk_order_number UNIQUE (order_number)',
    'SELECT "Constraint uk_order_number already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND CONSTRAINT_NAME = 'uk_appointment_reference'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE appointments ADD CONSTRAINT uk_appointment_reference UNIQUE (reference_number)',
    'SELECT "Constraint uk_appointment_reference already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 9. Update any NULL values to proper defaults
UPDATE products SET title = 'Untitled Product' WHERE title IS NULL OR title = '';
UPDATE products SET active = TRUE WHERE active IS NULL;
UPDATE products SET stock = 0 WHERE stock IS NULL;
UPDATE products SET price = 0.00 WHERE price IS NULL;
UPDATE products SET discount_percentage = 0.00 WHERE discount_percentage IS NULL;
UPDATE products SET rating = 0.0 WHERE rating IS NULL;
UPDATE products SET review_count = 0 WHERE review_count IS NULL;

UPDATE orders SET payment_status = 'PENDING' WHERE payment_status IS NULL;
UPDATE orders SET shipping_cost = 0.00 WHERE shipping_cost IS NULL;
UPDATE orders SET tax = 0.00 WHERE tax IS NULL;

UPDATE appointments SET duration_minutes = 30 WHERE duration_minutes IS NULL;
UPDATE appointments SET status = 'PENDING' WHERE status IS NULL;