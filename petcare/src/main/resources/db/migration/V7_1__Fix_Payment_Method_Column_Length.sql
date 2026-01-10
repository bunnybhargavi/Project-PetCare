-- Fix payment_method column length
-- The CASH_ON_DELIVERY enum value is 16 characters, and RAZORPAY is 8 characters
-- Increasing to VARCHAR(50) to ensure all payment methods fit comfortably

ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(50);
