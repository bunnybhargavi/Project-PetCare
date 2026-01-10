-- Migration V8: Remove password column from vendors table for OTP-based authentication
-- This migration removes the password field as vendors now use OTP authentication

-- Remove password column from vendors table
ALTER TABLE vendors DROP COLUMN IF EXISTS password;

-- Add comment to track the change
COMMENT ON TABLE vendors IS 'Vendor accounts using OTP-based authentication (password removed in V8)';