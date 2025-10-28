-- Migration: Add municipality column to addresses table
-- Date: 2025-10-28
-- Description: Adds municipality column to store Philippine municipality/city names

-- Add municipality column
ALTER TABLE addresses 
ADD COLUMN municipality VARCHAR(100) AFTER barangay;

-- Update existing records: copy city to municipality
UPDATE addresses 
SET municipality = city 
WHERE municipality IS NULL;

-- Make city nullable since we'll use municipality instead
ALTER TABLE addresses 
MODIFY COLUMN city VARCHAR(100) NULL;

