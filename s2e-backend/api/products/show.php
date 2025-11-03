<?php
/**
 * Get Single Product Endpoint
 * GET /api/products/{id} - Get a single product by ID
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Get product ID from URL
$requestUri = $_SERVER['REQUEST_URI'];
preg_match('/\/api\/products\/(\d+)/', $requestUri, $matches);
$productId = $matches[1] ?? null;

if (!$productId) {
    Response::error('Product ID is required', 400);
}

try {
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Get product with seller, category info, and ratings
    // Using subquery for ratings to ensure correct aggregation
    $query = "SELECT 
                p.*,
                c.name as category_name,
                c.slug as category_slug,
                s.business_name as seller_name,
                s.owner_name as seller_owner_name,
                s.email as seller_email,
                s.phone as seller_phone,
                s.id as seller_id,
                COALESCE((
                  SELECT AVG(rating) 
                  FROM reviews 
                  WHERE product_id = p.id
                ), 0) as average_rating,
                COALESCE((
                  SELECT COUNT(*) 
                  FROM reviews 
                  WHERE product_id = p.id
                ), 0) as review_count
              FROM products p
              LEFT JOIN categories c ON p.category_id = c.id
              LEFT JOIN sellers s ON p.seller_id = s.id
              WHERE p.id = :id AND p.status = 'published'";
    
    $stmt = $db->prepare($query);
    $stmt->bindValue(':id', $productId, PDO::PARAM_INT);
    $stmt->execute();
    
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$product) {
        Response::error('Product not found', 404);
    }
    
    // Parse JSON fields and format ratings
    $product['images'] = json_decode($product['images'] ?? '[]');
    $product['tags'] = json_decode($product['tags'] ?? '[]');
    
    // Format average rating (round to 1 decimal place)
    $averageRating = floatval($product['average_rating'] ?? 0);
    $product['average_rating'] = $averageRating > 0 ? round($averageRating, 1) : 0;
    $product['review_count'] = intval($product['review_count'] ?? 0);
    
    // Debug log for rating data
    error_log("Product Details - ID: {$product['id']}, Title: {$product['title']}, Avg Rating: {$product['average_rating']}, Review Count: {$product['review_count']}");
    
    Response::success([
        'product' => $product
    ], 'Product fetched successfully');
    
} catch (Exception $e) {
    error_log("Error fetching product: " . $e->getMessage());
    Response::error('Failed to fetch product', 500);
}

