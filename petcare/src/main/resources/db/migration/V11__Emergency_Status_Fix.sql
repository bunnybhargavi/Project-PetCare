-- V11: Emergency Fix for Status Column Size
-- Force increase size of status columns to 255 to resolve truncation errors

ALTER TABLE orders MODIFY COLUMN status VARCHAR(255) NOT NULL DEFAULT 'PENDING';
ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(255) DEFAULT 'PENDING';
ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(255);
