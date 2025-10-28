-- Migration: Update products table status ENUM to include 'proposed', 'published', 'rejected'
-- Date: 2025-10-28
-- Description: Add status options for seller-admin-customer workflow
-- Workflow: Seller creates (draft/proposed) → Admin publishes/rejects → Customer sees published

-- Run this in phpMyAdmin if your database already exists

ALTER TABLE products 
MODIFY COLUMN status ENUM('draft', 'proposed', 'published', 'rejected', 'archived') DEFAULT 'draft';

