<?php
/**
 * Test Seller Products Endpoint (NO AUTH)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../../config/database.php';

try {
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Get all products (for testing)
    $query = "SELECT * FROM products ORDER BY created_at DESC LIMIT 10";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $products = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'count' => count($products),
        'products' => $products
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

