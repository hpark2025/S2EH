<?php
/**
 * Update User Password Endpoint
 * PUT /api/users/password
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept PUT/PATCH requests
if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'PATCH'])) {
    Response::error('Method not allowed', 405);
}

// Authenticate user
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user) {
    Response::unauthorized();
}

// Get request body
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    Response::error('Invalid request data', 400);
}

// Validate required fields
if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
    Response::error('Current password and new password are required', 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $userId = $user['id'];
    $currentPassword = $data['currentPassword'];
    $newPassword = $data['newPassword'];
    
    // Verify current password
    $query = "SELECT password FROM users WHERE id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$userData) {
        Response::error('User not found', 404);
    }
    
    // Verify current password (check if using password_hash or plain text)
    $passwordValid = false;
    if (password_verify($currentPassword, $userData['password'])) {
        // Password is hashed
        $passwordValid = true;
    } elseif ($userData['password'] === $currentPassword) {
        // Password is plain text (legacy support)
        $passwordValid = true;
    }
    
    if (!$passwordValid) {
        Response::error('Current password is incorrect', 401);
    }
    
    // Validate new password length
    if (strlen($newPassword) < 4) {
        Response::error('New password must be at least 4 characters long', 400);
    }
    
    // Hash new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update password
    $updateQuery = "UPDATE users SET password = :password, updated_at = CURRENT_TIMESTAMP WHERE id = :user_id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':password', $hashedPassword);
    $updateStmt->bindParam(':user_id', $userId);
    
    if ($updateStmt->execute()) {
        Response::success([], 'Password updated successfully');
    } else {
        Response::error('Failed to update password', 500);
    }
    
} catch (Exception $e) {
    error_log('Update Password Error: ' . $e->getMessage());
    Response::error('Failed to update password: ' . $e->getMessage(), 500);
}

