<?php
/**
 * Reject User Endpoint (Admin only)
 * POST /api/users/reject - Reject a user account
 */

// Set CORS headers FIRST - simple wildcard for admin endpoints
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['user_id'])) {
    Response::error('User ID is required', 400);
}

$userId = (int)$data['user_id'];
$reason = $data['reason'] ?? null;

try {
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Update user status to inactive (rejected)
    $query = "UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$userId]);
    
    if ($stmt->rowCount() > 0) {
        Response::success('User rejected successfully', [
            'user_id' => $userId,
            'status' => 'inactive',
            'reason' => $reason
        ]);
    } else {
        Response::error('User not found', 404);
    }
    
} catch (Exception $e) {
    error_log("Reject user error: " . $e->getMessage());
    Response::error('Failed to reject user: ' . $e->getMessage(), 500);
}

