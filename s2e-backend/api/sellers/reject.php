<?php
/**
 * Reject Seller Endpoint (Admin only)
 * POST /api/sellers/reject
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

// Authenticate admin
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user || $user['user_type'] !== 'admin') {
    Response::unauthorized('Admin access required');
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->seller_id)) {
    Response::validationError(['seller_id' => 'Seller ID is required']);
}

$sellerId = $data->seller_id;
$reason = $data->reason ?? null;

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Update seller verification status to 'rejected'
$query = "UPDATE sellers 
          SET verification_status = 'rejected',
              status = 'inactive'
          WHERE id = :seller_id";

$stmt = $db->prepare($query);
$stmt->bindParam(':seller_id', $sellerId);

if ($stmt->execute()) {
    // Get updated seller
    $getQuery = "SELECT * FROM sellers WHERE id = :seller_id";
    $getStmt = $db->prepare($getQuery);
    $getStmt->bindParam(':seller_id', $sellerId);
    $getStmt->execute();
    
    $seller = $getStmt->fetch();
    unset($seller['password']);
    
    Response::success([
        'seller' => $seller,
        'reason' => $reason
    ], 'Seller rejected');
} else {
    Response::serverError('Failed to reject seller');
}

