<?php
/**
 * Seller Stats Endpoint
 * GET /api/seller/stats - Get seller statistics from database
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Authenticate seller
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user || $user['user_type'] !== 'seller') {
    Response::unauthorized('Seller access required');
}

$sellerId = $user['id'];

// Connect to database
$database = new Database();
$db = $database->getConnection();

try {
    // Get products count
    $productsQuery = "SELECT COUNT(*) as total FROM products WHERE seller_id = :seller_id";
    $productsStmt = $db->prepare($productsQuery);
    $productsStmt->bindParam(':seller_id', $sellerId, PDO::PARAM_INT);
    $productsStmt->execute();
    $productsCount = (int)$productsStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get orders count
    $ordersQuery = "SELECT COUNT(*) as total FROM orders WHERE seller_id = :seller_id";
    $ordersStmt = $db->prepare($ordersQuery);
    $ordersStmt->bindParam(':seller_id', $sellerId, PDO::PARAM_INT);
    $ordersStmt->execute();
    $ordersCount = (int)$ordersStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get unique customers count from orders table
    $customersQuery = "SELECT COUNT(DISTINCT user_id) as total 
                      FROM orders 
                      WHERE seller_id = :seller_id AND user_id IS NOT NULL";
    $customersStmt = $db->prepare($customersQuery);
    $customersStmt->bindParam(':seller_id', $sellerId, PDO::PARAM_INT);
    $customersStmt->execute();
    $customersCount = (int)$customersStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get revenue from delivered/completed orders
    $revenueQuery = "SELECT COALESCE(SUM(total), 0) as total 
                     FROM orders 
                     WHERE seller_id = :seller_id 
                     AND status IN ('delivered', 'completed')";
    $revenueStmt = $db->prepare($revenueQuery);
    $revenueStmt->bindParam(':seller_id', $sellerId, PDO::PARAM_INT);
    $revenueStmt->execute();
    $revenue = (float)$revenueStmt->fetch(PDO::FETCH_ASSOC)['total'];

    Response::success([
        'products' => $productsCount,
        'orders' => $ordersCount,
        'customers' => $customersCount,
        'revenue' => $revenue
    ], 'Stats fetched successfully');

} catch (Exception $e) {
    error_log('Seller Stats Error: ' . $e->getMessage());
    Response::error('Failed to fetch stats: ' . $e->getMessage(), 500);
}

