-- V20: Ultimate Fix for Orders Table
-- Force modify columns to be large enough and handle potential enum issues

SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE orders MODIFY COLUMN status VARCHAR(255) NOT NULL DEFAULT 'PENDING';
ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(255) DEFAULT 'PENDING';
ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(255) DEFAULT NULL;
ALTER TABLE orders MODIFY COLUMN shipping_state VARCHAR(255) DEFAULT NULL;
ALTER TABLE orders MODIFY COLUMN shipping_city VARCHAR(255) DEFAULT NULL;

SET FOREIGN_KEY_CHECKS=1;
