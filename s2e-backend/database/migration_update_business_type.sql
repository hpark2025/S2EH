-- Migration: Update business_type ENUM to include more categories
-- Run this to update the business_type column

USE s2eh_db;

-- Modify the business_type column to include more options
ALTER TABLE sellers 
MODIFY COLUMN business_type ENUM(
    'individual',
    'cooperative', 
    'enterprise',
    'agriculture',
    'fishery',
    'food',
    'handicrafts',
    'livestock',
    'retail',
    'services',
    'other'
) DEFAULT 'individual';

-- Verify the change
DESCRIBE sellers;

