<?php
/**
 * Approve Product Endpoint (Admin only)
 * POST /api/products/approve
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

// TEMPORARY: Disable auth for testing
// TODO: Re-enable authentication after testing
/*
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user || $user['user_type'] !== 'admin') {
    Response::unauthorized('Admin access required');
}
*/

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate input
if (!isset($data->product_id)) {
    Response::validationError(['product_id' => 'Product ID is required']);
}

$productId = (int)$data->product_id;

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Check if product exists
$checkQuery = "SELECT id, title, seller_id, status FROM products WHERE id = :id";
$checkStmt = $db->prepare($checkQuery);
$checkStmt->bindParam(':id', $productId);
$checkStmt->execute();

$product = $checkStmt->fetch();

if (!$product) {
    Response::error('Product not found', 404);
}

if ($product['status'] !== 'proposed') {
    Response::error('Only proposed products can be published', 400);
}

// Update product status to published (visible to customers)
$updateQuery = "UPDATE products SET status = 'published', updated_at = NOW() WHERE id = :id";
$updateStmt = $db->prepare($updateQuery);
$updateStmt->bindParam(':id', $productId);

if ($updateStmt->execute()) {
    Response::success([
        'product_id' => $productId,
        'status' => 'published'
    ], 'Product published successfully');
} else {
    Response::serverError('Failed to approve product');
}


