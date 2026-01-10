-- V7__Add_Vendor_System.sql
-- Create vendor system tables

-- Create vendors table
CREATE TABLE vendors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    business_license VARCHAR(255),
    tax_id VARCHAR(50),
    status ENUM('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_vendor_email (email),
    INDEX idx_vendor_status (status)
);

-- Add vendor_id to products table
ALTER TABLE products 
ADD COLUMN vendor_id BIGINT AFTER id,
ADD FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
ADD INDEX idx_product_vendor (vendor_id);

-- Create vendor_orders view for vendor-specific order management
CREATE VIEW vendor_orders AS
SELECT 
    o.id as order_id,
    o.order_number,
    o.user_id,
    o.status as order_status,
    o.payment_status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    oi.id as order_item_id,
    oi.product_id,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    p.vendor_id,
    p.title as product_name,
    u.name as customer_name,
    u.email as customer_email
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN users u ON o.user_id = u.id
WHERE p.vendor_id IS NOT NULL;

-- Insert sample vendor data
INSERT INTO vendors (business_name, contact_name, email, password, phone, address, city, state, zip_code, status) VALUES
('Pet Paradise Supplies', 'John Smith', 'vendor1@petparadise.com', '$2a$10$example.hash.here', '+1-555-0101', '123 Pet Street', 'Pet City', 'CA', '90210', 'APPROVED'),
('Happy Paws Products', 'Sarah Johnson', 'vendor2@happypaws.com', '$2a$10$example.hash.here', '+1-555-0102', '456 Animal Ave', 'Pet Town', 'NY', '10001', 'APPROVED'),
('Furry Friends Store', 'Mike Wilson', 'vendor3@furryfriends.com', '$2a$10$example.hash.here', '+1-555-0103', '789 Companion Blvd', 'Pet Village', 'TX', '75001', 'PENDING');

-- Update existing products to have vendor associations
UPDATE products SET vendor_id = 1 WHERE id IN (1, 2, 3, 4, 5, 6);
UPDATE products SET vendor_id = 2 WHERE id IN (7, 8, 9, 10, 11, 12);
UPDATE products SET vendor_id = 3 WHERE id IN (13, 14, 15, 16, 17, 18);