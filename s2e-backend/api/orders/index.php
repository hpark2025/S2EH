<?php
/**
 * Orders API Endpoint
 * GET /api/orders - Get user orders
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Authenticate user
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user) {
    Response::unauthorized();
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Get orders based on user type
if ($user['user_type'] === 'user') {
    // Customer orders
    $query = "SELECT o.*, s.business_name as seller_name
              FROM orders o
              LEFT JOIN sellers s ON o.seller_id = s.id
              WHERE o.user_id = :user_id
              ORDER BY o.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    
} elseif ($user['user_type'] === 'seller') {
    // Seller orders
    $query = "SELECT o.*, u.first_name, u.last_name, u.email as customer_email
              FROM orders o
              LEFT JOIN users u ON o.user_id = u.id
              WHERE o.seller_id = :seller_id
              ORDER BY o.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':seller_id', $user['id']);
    
} elseif ($user['user_type'] === 'admin') {
    // Admin - all orders
    $query = "SELECT o.*, 
                     u.first_name, u.last_name, u.email as customer_email,
                     s.business_name as seller_name
              FROM orders o
              LEFT JOIN users u ON o.user_id = u.id
              LEFT JOIN sellers s ON o.seller_id = s.id
              ORDER BY o.created_at DESC";
    
    $stmt = $db->prepare($query);
} else {
    Response::unauthorized();
}

$stmt->execute();
$orders = $stmt->fetchAll();

// Get order items for each order
foreach ($orders as &$order) {
    $itemsQuery = "SELECT * FROM order_items WHERE order_id = :order_id";
    $itemsStmt = $db->prepare($itemsQuery);
    $itemsStmt->bindParam(':order_id', $order['id']);
    $itemsStmt->execute();
    
    $order['items'] = $itemsStmt->fetchAll();
}

Response::success(['orders' => $orders]);

