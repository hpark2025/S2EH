-- Migration: Add business_description column to sellers table
-- Run this if you already created the database without this column

USE s2eh_db;

-- Add business_description column if it doesn't exist
ALTER TABLE sellers 
ADD COLUMN IF NOT EXISTS business_description TEXT AFTER business_type;

-- Verify the change
DESCRIBE sellers;

