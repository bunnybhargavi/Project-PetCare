-- Fix Marketplace Schema Migration
-- Handles existing products table and adds marketplace functionality

-- First, check if products table exists and modify it
-- If is_active column exists, rename it to active
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'is_active'
);

-- Rename is_active to active if it exists
SET @sql = IF(@column_exists > 0,
    'ALTER TABLE products CHANGE COLUMN is_active active BOOLEAN DEFAULT TRUE',
    'SELECT "Column is_active does not exist" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add missing columns to products table if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS brand VARCHAR(255),
ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
ADD COLUMN IF NOT EXISTS rating DOUBLE DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);

-- Create unique constraint on SKU if it doesn't exist
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'products'
    AND CONSTRAINT_NAME = 'uk_sku'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE products ADD CONSTRAINT uk_sku UNIQUE (sku)',
    'SELECT "Constraint uk_sku already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_images (
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
);

-- Create carts table if it doesn't exist
CREATE TABLE IF NOT EXISTS carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_cart (user_id)
);

-- Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uk_cart_product (cart_id, product_id),
    INDEX idx_cart_id (cart_id),
    INDEX idx_product_id (product_id)
);

-- Modify orders table to add marketplace fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tax DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_zip_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS payment_transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add unique constraint on order_number if it doesn't exist
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

-- Create order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- Clear existing products and insert sample data
DELETE FROM products WHERE category IN ('FOOD', 'TOYS', 'HEALTH', 'GROOMING', 'ACCESSORIES', 'BEDS', 'TRAINING', 'TRAVEL');

-- Insert sample products
INSERT INTO products (title, description, price, stock, category, brand, sku, rating, review_count, active) VALUES
-- Food & Treats
('Premium Dog Food - Chicken & Rice', 'High-quality dry dog food with real chicken and brown rice. Perfect for adult dogs of all sizes.', 45.99, 50, 'FOOD', 'PetNutrition Pro', 'PNP-DOG-001', 4.5, 127, TRUE),
('Organic Cat Treats - Salmon', 'Delicious organic salmon treats for cats. Made with wild-caught salmon and no artificial preservatives.', 12.99, 75, 'FOOD', 'Natural Pet', 'NP-CAT-002', 4.8, 89, TRUE),
('Puppy Training Treats', 'Small, soft training treats perfect for puppies. Chicken flavor with added vitamins.', 8.99, 100, 'FOOD', 'TrainRight', 'TR-PUP-003', 4.3, 156, TRUE),

-- Toys & Entertainment
('Interactive Puzzle Toy', 'Mental stimulation puzzle toy for dogs. Helps reduce boredom and anxiety.', 24.99, 30, 'TOYS', 'BrainPet', 'BP-TOY-004', 4.6, 203, TRUE),
('Feather Wand Cat Toy', 'Interactive feather wand toy for cats. Promotes exercise and hunting instincts.', 15.99, 45, 'TOYS', 'FelinePlay', 'FP-CAT-005', 4.4, 78, TRUE),
('Rope Chew Toy', 'Durable rope toy for dogs. Great for dental health and aggressive chewers.', 9.99, 60, 'TOYS', 'ChewMaster', 'CM-DOG-006', 4.2, 134, TRUE),

-- Health & Wellness
('Multivitamin Supplements', 'Daily multivitamin supplements for dogs. Supports immune system and overall health.', 29.99, 40, 'HEALTH', 'VitaPet', 'VP-SUP-007', 4.7, 92, TRUE),
('Flea & Tick Collar', 'Long-lasting flea and tick protection collar for dogs. Waterproof and effective for 8 months.', 34.99, 25, 'HEALTH', 'PestGuard', 'PG-COL-008', 4.5, 167, TRUE),
('Joint Support Chews', 'Glucosamine and chondroitin chews for senior dogs. Supports joint health and mobility.', 39.99, 35, 'HEALTH', 'SeniorCare', 'SC-CHW-009', 4.8, 145, TRUE),

-- Grooming & Care
('Professional Dog Brush', 'High-quality slicker brush for dogs. Removes loose fur and prevents matting.', 18.99, 55, 'GROOMING', 'GroomPro', 'GP-BRU-010', 4.3, 89, TRUE),
('Waterless Cat Shampoo', 'Gentle waterless shampoo for cats. Perfect for cats who hate water baths.', 16.99, 40, 'GROOMING', 'CleanPaws', 'CP-SHA-011', 4.6, 76, TRUE),
('Nail Clippers Set', 'Professional nail clippers for dogs and cats. Includes safety guard and nail file.', 22.99, 30, 'GROOMING', 'SafeTrim', 'ST-CLI-012', 4.4, 112, TRUE),

-- Accessories
('Adjustable Dog Collar', 'Comfortable adjustable collar for dogs. Available in multiple colors and sizes.', 14.99, 80, 'ACCESSORIES', 'ComfortFit', 'CF-COL-013', 4.2, 198, TRUE),
('Retractable Dog Leash', 'Durable retractable leash with 16ft extension. Perfect for walks and training.', 26.99, 45, 'ACCESSORIES', 'WalkEasy', 'WE-LEA-014', 4.5, 156, TRUE),
('Cat ID Tag', 'Personalized ID tag for cats. Engraved with pet name and owner contact information.', 7.99, 100, 'ACCESSORIES', 'SafeReturn', 'SR-TAG-015', 4.7, 234, TRUE),

-- Beds & Furniture
('Orthopedic Dog Bed', 'Memory foam orthopedic bed for large dogs. Provides superior comfort and joint support.', 89.99, 20, 'BEDS', 'ComfortRest', 'CR-BED-016', 4.8, 167, TRUE),
('Cat Tree Tower', 'Multi-level cat tree with scratching posts, perches, and hiding spots. Perfect for indoor cats.', 129.99, 15, 'BEDS', 'FelineHaven', 'FH-TRE-017', 4.6, 89, TRUE),
('Heated Pet Blanket', 'Electric heated blanket for pets. Safe, washable, and perfect for senior pets.', 49.99, 25, 'BEDS', 'WarmPaws', 'WP-BLA-018', 4.4, 123, TRUE),

-- Training & Behavior
('Clicker Training Kit', 'Complete clicker training kit with guide book. Perfect for positive reinforcement training.', 19.99, 50, 'TRAINING', 'PositivePet', 'PP-CLI-019', 4.5, 145, TRUE),
('Anti-Bark Collar', 'Humane anti-bark collar with vibration and sound correction. Adjustable sensitivity levels.', 59.99, 20, 'TRAINING', 'QuietPaws', 'QP-COL-020', 4.1, 78, TRUE),

-- Travel & Carriers
('Airline Approved Carrier', 'TSA approved pet carrier for air travel. Comfortable and secure for cats and small dogs.', 79.99, 18, 'TRAVEL', 'SkyPet', 'SP-CAR-021', 4.7, 134, TRUE),
('Car Safety Harness', 'Crash-tested safety harness for dogs. Keeps pets secure during car rides.', 34.99, 35, 'TRAVEL', 'SafeRide', 'SR-HAR-022', 4.3, 167, TRUE);

-- Clear existing product images and insert new ones
DELETE FROM product_images;

-- Insert sample product images
INSERT INTO product_images (product_id, image_url) 
SELECT p.id, CONCAT('/images/products/', LOWER(REPLACE(p.title, ' ', '-')), '-1.jpg')
FROM products p
WHERE p.category IN ('FOOD', 'TOYS', 'HEALTH', 'GROOMING', 'ACCESSORIES', 'BEDS', 'TRAINING', 'TRAVEL');