<?php
// Simple product delete endpoint
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';

// Get product ID from query string
$productId = $_GET['id'] ?? null;

if (!$productId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Product ID is required']);
    exit();
}

$database = new Database();
$db = $database->getConnection();

// Delete the product
$deleteQuery = "DELETE FROM products WHERE id = :id";
$deleteStmt = $db->prepare($deleteQuery);
$deleteStmt->bindParam(':id', $productId);

if ($deleteStmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Product deleted successfully',
        'data' => ['id' => $productId]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to delete product']);
}

