-- Marketplace Database Migration
-- Creates tables for products, cart, orders, and related entities

-- Products table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    brand VARCHAR(255),
    sku VARCHAR(100),
    rating DOUBLE DEFAULT 0.0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (active),
    INDEX idx_price (price),
    INDEX idx_stock (stock),
    INDEX idx_rating (rating),
    UNIQUE KEY uk_sku (sku)
);

-- Product images table (for multiple images per product)
CREATE TABLE product_images (
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
);

-- Carts table
CREATE TABLE carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_cart (user_id)
);

-- Cart items table
CREATE TABLE cart_items (
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

-- Orders table
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Shipping information
    shipping_name VARCHAR(255) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_zip_code VARCHAR(20) NOT NULL,
    shipping_phone VARCHAR(20),
    
    -- Payment information
    payment_method VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    payment_transaction_id VARCHAR(255),
    
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_order_number (order_number),
    INDEX idx_created_at (created_at)
);

-- Order items table
CREATE TABLE order_items (
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

-- Insert sample product images
INSERT INTO product_images (product_id, image_url) VALUES
-- Dog Food images
(1, '/images/products/dog-food-1.jpg'),
(1, '/images/products/dog-food-2.jpg'),
-- Cat Treats images
(2, '/images/products/cat-treats-1.jpg'),
(2, '/images/products/cat-treats-2.jpg'),
-- Puppy Treats images
(3, '/images/products/puppy-treats-1.jpg'),
-- Puzzle Toy images
(4, '/images/products/puzzle-toy-1.jpg'),
(4, '/images/products/puzzle-toy-2.jpg'),
-- Feather Wand images
(5, '/images/products/feather-wand-1.jpg'),
-- Rope Toy images
(6, '/images/products/rope-toy-1.jpg'),
-- Multivitamin images
(7, '/images/products/multivitamin-1.jpg'),
-- Flea Collar images
(8, '/images/products/flea-collar-1.jpg'),
-- Joint Chews images
(9, '/images/products/joint-chews-1.jpg'),
-- Dog Brush images
(10, '/images/products/dog-brush-1.jpg'),
-- Cat Shampoo images
(11, '/images/products/cat-shampoo-1.jpg'),
-- Nail Clippers images
(12, '/images/products/nail-clippers-1.jpg'),
-- Dog Collar images
(13, '/images/products/dog-collar-1.jpg'),
(13, '/images/products/dog-collar-2.jpg'),
-- Dog Leash images
(14, '/images/products/dog-leash-1.jpg'),
-- Cat Tag images
(15, '/images/products/cat-tag-1.jpg'),
-- Dog Bed images
(16, '/images/products/dog-bed-1.jpg'),
(16, '/images/products/dog-bed-2.jpg'),
-- Cat Tree images
(17, '/images/products/cat-tree-1.jpg'),
(17, '/images/products/cat-tree-2.jpg'),
-- Heated Blanket images
(18, '/images/products/heated-blanket-1.jpg'),
-- Clicker Kit images
(19, '/images/products/clicker-kit-1.jpg'),
-- Anti-Bark Collar images
(20, '/images/products/anti-bark-collar-1.jpg'),
-- Carrier images
(21, '/images/products/carrier-1.jpg'),
(21, '/images/products/carrier-2.jpg'),
-- Safety Harness images
(22, '/images/products/safety-harness-1.jpg');