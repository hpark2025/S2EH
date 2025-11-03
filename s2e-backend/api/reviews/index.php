<?php
/**
 * Get Reviews Endpoint
 * GET /api/reviews/?order_id=123
 * GET /api/reviews/?product_id=456
 * GET /api/reviews/?user_id=789
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $orderId = $_GET['order_id'] ?? null;
    $productId = $_GET['product_id'] ?? null;
    $userId = $_GET['user_id'] ?? null;
    
    // Build query based on filters
    $query = "SELECT r.*, 
                     u.first_name, u.last_name,
                     p.title as product_title
              FROM reviews r
              LEFT JOIN users u ON r.user_id = u.id
              LEFT JOIN products p ON r.product_id = p.id
              WHERE 1=1";
    
    $params = [];
    
    if ($orderId) {
        $query .= " AND r.order_id = :order_id";
        $params[':order_id'] = intval($orderId);
    }
    
    if ($productId) {
        $query .= " AND r.product_id = :product_id";
        $params[':product_id'] = intval($productId);
    }
    
    if ($userId) {
        $query .= " AND r.user_id = :user_id";
        $params[':user_id'] = intval($userId);
    }
    
    $query .= " ORDER BY r.created_at DESC";
    
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group reviews by product_id if order_id is specified
    $groupedReviews = [];
    if ($orderId) {
        foreach ($reviews as $review) {
            $groupedReviews[$review['product_id']] = $review;
        }
    }
    
    Response::success([
        'reviews' => $orderId ? $groupedReviews : $reviews,
        'count' => count($reviews)
    ], 'Reviews fetched successfully');
    
} catch (Exception $e) {
    error_log('Get Reviews Error: ' . $e->getMessage());
    Response::error('Failed to fetch reviews: ' . $e->getMessage(), 500);
}

