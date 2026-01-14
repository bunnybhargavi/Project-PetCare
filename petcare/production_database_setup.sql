-- Production Database Setup Script for PetCare
-- Run this script on your production MySQL server

-- Create production database
CREATE DATABASE IF NOT EXISTS petcare_production 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create production user (replace with secure credentials)
-- CREATE USER 'petcare_user'@'%' IDENTIFIED BY 'your_secure_password_here';
-- GRANT ALL PRIVILEGES ON petcare_production.* TO 'petcare_user'@'%';
-- FLUSH PRIVILEGES;

-- Use the production database
USE petcare_production;

-- Set proper timezone
SET time_zone = '+00:00';

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Set proper SQL mode for production
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Create indexes for better performance
-- These will be created by Hibernate/Flyway, but listing here for reference

-- Performance optimization settings
SET innodb_buffer_pool_size = 1G;  -- Adjust based on your server RAM
SET innodb_log_file_size = 256M;
SET innodb_flush_log_at_trx_commit = 2;
SET innodb_flush_method = O_DIRECT;

-- Show database info
SELECT 
    'Database created successfully' as status,
    DATABASE() as current_database,
    @@character_set_database as charset,
    @@collation_database as collation,
    NOW() as created_at;