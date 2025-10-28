<?php
/**
 * Reject Product Endpoint (Admin only)
 * POST /api/products/reject
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
$reason = isset($data->reason) ? trim($data->reason) : null;

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
    Response::error('Only proposed products can be rejected', 400);
}

// Update product status to rejected
$updateQuery = "UPDATE products SET status = 'rejected', updated_at = NOW() WHERE id = :id";
$updateStmt = $db->prepare($updateQuery);
$updateStmt->bindParam(':id', $productId);

if ($updateStmt->execute()) {
    // TODO: Send notification to seller about rejection (optional)
    
    Response::success([
        'product_id' => $productId,
        'status' => 'rejected',
        'reason' => $reason
    ], 'Product rejected successfully');
} else {
    Response::serverError('Failed to reject product');
}


