<?php
// Simple products endpoint - NO routing, NO auth, JUST DATA
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

// Hardcoded seller ID for testing
$sellerId = 10;

$query = "SELECT * FROM products WHERE seller_id = :seller_id ORDER BY created_at DESC";
$stmt = $db->prepare($query);
$stmt->bindParam(':seller_id', $sellerId);
$stmt->execute();
$products = $stmt->fetchAll();

// Parse JSON fields
foreach ($products as &$product) {
    $product['images'] = json_decode($product['images'] ?? '[]');
    $product['tags'] = json_decode($product['tags'] ?? '[]');
}

echo json_encode([
    'success' => true,
    'message' => 'Products fetched successfully',
    'data' => [
        'products' => $products,
        'pagination' => ['page' => 1, 'limit' => 100, 'total' => count($products), 'pages' => 1],
        'stats' => ['draft' => 0, 'proposed' => count($products), 'published' => 0, 'rejected' => 0]
    ]
]);

