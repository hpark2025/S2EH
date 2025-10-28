<?php
/**
 * Categories API Endpoint
 * GET /api/categories - Get all categories (public)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Get all active categories
$query = "SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC";
$stmt = $db->prepare($query);
$stmt->execute();

$categories = $stmt->fetchAll();

Response::success(['categories' => $categories]);

