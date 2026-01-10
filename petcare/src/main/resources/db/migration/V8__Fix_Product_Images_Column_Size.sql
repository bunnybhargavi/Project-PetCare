-- V8: Fix Product Images Column Size for Base64 Images
-- This migration increases the image_url column size to support base64-encoded images

-- Increase image_url column size to LONGTEXT to support base64 images
-- Base64 images can be very large (50KB-500KB+), so we need LONGTEXT instead of VARCHAR(500)
ALTER TABLE product_images 
MODIFY COLUMN image_url LONGTEXT NOT NULL;

-- Also update the products table images column if it exists and is too small
-- Check if products table has an images column and update it
SET @sql = (
    SELECT CASE 
        WHEN COUNT(*) > 0 THEN 'ALTER TABLE products MODIFY COLUMN images JSON;'
        ELSE 'SELECT "products.images column does not exist or is already correct" as message;'
    END
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'images'
    AND DATA_TYPE != 'json'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;