-- Migration to update payment system from Razorpay to PayPal
-- V9__Update_Payment_System_To_PayPal.sql

-- Update payments table
ALTER TABLE payments 
DROP COLUMN IF EXISTS razorpay_order_id,
DROP COLUMN IF EXISTS razorpay_payment_id,
DROP COLUMN IF EXISTS razorpay_signature;

ALTER TABLE payments 
ADD COLUMN paypal_payment_id VARCHAR(255) UNIQUE,
ADD COLUMN paypal_payer_id VARCHAR(255);

-- Update orders table
ALTER TABLE orders 
DROP COLUMN IF EXISTS razorpay_order_id;

ALTER TABLE orders 
ADD COLUMN paypal_payment_id VARCHAR(255);

-- Update any existing payment records to set default values
UPDATE payments SET paypal_payment_id = CONCAT('mock_paypal_', id) WHERE paypal_payment_id IS NULL;

-- Update payment method enum values if needed
-- Note: This might require manual intervention depending on your database setup
-- You may need to update any existing records that have 'RAZORPAY' as payment method to 'PAYPAL'
UPDATE orders SET payment_method = 'PAYPAL' WHERE payment_method = 'RAZORPAY';