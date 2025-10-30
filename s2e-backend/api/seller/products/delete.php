<?php
/**
 * Delete Product Endpoint (Seller only)
 * DELETE /api/seller/products/{id}
 */

// CORS headers FIRST
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
if (in_array($origin, ['http://localhost:5173', 'http://localhost:5174'])) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../helpers/Response.php';
require_once __DIR__ . '/../../../helpers/Auth.php';

// Only accept DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    Response::error('Method not allowed', 405);
}

// Authenticate seller
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user || $user['user_type'] !== 'seller') {
    Response::unauthorized('Seller access required');
}

error_log("✅ Seller delete endpoint - Seller ID: " . $user['id']);

// Get product ID from URL
$urlParts = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
$productId = end($urlParts);

if (!$productId || !is_numeric($productId)) {
    Response::error('Invalid product ID', 400);
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Verify product belongs to this seller
$checkQuery = "SELECT id, title FROM products WHERE id = :id AND seller_id = :seller_id";
$checkStmt = $db->prepare($checkQuery);
$checkStmt->bindParam(':id', $productId);
$checkStmt->bindParam(':seller_id', $user['id']);
$checkStmt->execute();

if ($checkStmt->rowCount() === 0) {
    Response::error('Product not found or you do not have permission to delete it', 404);
}

$product = $checkStmt->fetch();

// Delete the product
$deleteQuery = "DELETE FROM products WHERE id = :id";
$deleteStmt = $db->prepare($deleteQuery);
$deleteStmt->bindParam(':id', $productId);

if ($deleteStmt->execute()) {
    Response::success([
        'id' => $productId,
        'title' => $product['title']
    ], 'Product deleted successfully');
} else {
    Response::serverError('Failed to delete product');
}

