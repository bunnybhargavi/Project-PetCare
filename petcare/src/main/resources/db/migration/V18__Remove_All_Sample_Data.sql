-- V18: Remove All Sample Data for Truly Dynamic System
-- This migration removes all manually inserted sample data to ensure
-- the system starts completely empty and relies only on user-generated data

-- Remove sample prescriptions
DELETE FROM prescriptions WHERE id BETWEEN 801 AND 899;

-- Remove sample reminders  
DELETE FROM reminders WHERE id BETWEEN 701 AND 799;
DELETE FROM reminders WHERE pet_id BETWEEN 1 AND 99; -- From V12 migration

-- Remove sample health measurements
DELETE FROM health_measurements WHERE id BETWEEN 601 AND 699;
DELETE FROM health_measurements WHERE pet_id BETWEEN 1 AND 99; -- From V12 and V13 migrations

-- Remove sample vaccinations
DELETE FROM vaccinations WHERE id BETWEEN 501 AND 599;
DELETE FROM vaccinations WHERE pet_id BETWEEN 1 AND 99; -- From V12 migration

-- Remove sample medical records
DELETE FROM medical_records WHERE id BETWEEN 401 AND 499;
DELETE FROM medical_records WHERE pet_id BETWEEN 1 AND 99; -- From V12 migration

-- Remove sample appointments
DELETE FROM appointments WHERE id BETWEEN 301 AND 399;
DELETE FROM appointments WHERE pet_id BETWEEN 1 AND 99; -- From V14 migration

-- Remove sample pets
DELETE FROM pets WHERE id BETWEEN 201 AND 299; -- From V15 migration
DELETE FROM pets WHERE id BETWEEN 1 AND 99; -- From V14 migration

-- Remove sample pet owners (if they exist in pet_owners table)
DELETE FROM pet_owners WHERE user_id BETWEEN 101 AND 199;
DELETE FROM pet_owners WHERE user_id BETWEEN 1 AND 99; -- From V14 migration

-- Remove sample users
DELETE FROM users WHERE id BETWEEN 101 AND 199; -- From V15 migration
DELETE FROM users WHERE id BETWEEN 1 AND 99; -- From V14 migration

-- Remove sample veterinarians
DELETE FROM veterinarians WHERE id BETWEEN 1 AND 99; -- From V15 migration
DELETE FROM veterinarians WHERE user_id BETWEEN 1 AND 99; -- From V14 migration

-- Remove sample products (keeping categories as they're needed for functionality)
DELETE FROM product_images WHERE product_id BETWEEN 1 AND 999;
DELETE FROM products WHERE id BETWEEN 1 AND 999;

-- Remove sample vendors
DELETE FROM vendors WHERE id BETWEEN 1 AND 99;

-- Reset auto-increment counters to start fresh
-- Note: This ensures new data starts with clean IDs
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE veterinarians AUTO_INCREMENT = 1;
ALTER TABLE pet_owners AUTO_INCREMENT = 1;
ALTER TABLE pets AUTO_INCREMENT = 1;
ALTER TABLE appointments AUTO_INCREMENT = 1;
ALTER TABLE medical_records AUTO_INCREMENT = 1;
ALTER TABLE vaccinations AUTO_INCREMENT = 1;
ALTER TABLE health_measurements AUTO_INCREMENT = 1;
ALTER TABLE reminders AUTO_INCREMENT = 1;
ALTER TABLE prescriptions AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE product_images AUTO_INCREMENT = 1;
ALTER TABLE vendors AUTO_INCREMENT = 1;

-- Note: Categories and other reference data are preserved
-- as they are needed for the application to function properly