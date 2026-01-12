-- V6__Add_Payment_System.sql
-- Create payments table for Razorpay integration

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('INITIATED', 'SUCCESS', 'FAILED', 'CANCELLED') DEFAULT 'INITIATED',
    payment_method VARCHAR(50),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_razorpay_order_id (razorpay_order_id),
    INDEX idx_razorpay_payment_id (razorpay_payment_id),
    INDEX idx_payment_status (status),
    INDEX idx_order_payment (order_id, status)
);

-- Add payment_status column to orders table
ALTER TABLE orders 
ADD COLUMN payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING' AFTER status,
ADD COLUMN razorpay_order_id VARCHAR(255) AFTER payment_status,
ADD INDEX idx_payment_status (payment_status),
ADD INDEX idx_razorpay_order_id (razorpay_order_id);

-- Update existing orders to have PENDING payment status
UPDATE orders SET payment_status = 'PENDING' WHERE payment_status IS NULL;