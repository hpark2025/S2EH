-- Migration: Add 'pending' status to users table
-- Date: 2025-10-28
-- Description: Allows users to have pending status for admin approval

-- Update status ENUM to include 'pending'
ALTER TABLE users 
MODIFY COLUMN status ENUM('pending', 'active', 'inactive', 'suspended') DEFAULT 'pending';

-- Update existing users to pending if they're currently active (optional - comment out if you want to keep existing users as active)
-- UPDATE users SET status = 'pending' WHERE status = 'active';

