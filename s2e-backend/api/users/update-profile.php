<?php
/**
 * Update User Profile Endpoint
 * PUT /api/users/profile
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

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Build update query dynamically based on provided fields
    $updateFields = [];
    $params = [':user_id' => $user['id']];
    
    if (isset($data['first_name'])) {
        $updateFields[] = "first_name = :first_name";
        $params[':first_name'] = $data['first_name'];
    }
    
    if (isset($data['last_name'])) {
        $updateFields[] = "last_name = :last_name";
        $params[':last_name'] = $data['last_name'];
    }
    
    if (isset($data['phone'])) {
        $updateFields[] = "phone = :phone";
        $params[':phone'] = $data['phone'];
    }
    
    if (isset($data['email'])) {
        $updateFields[] = "email = :email";
        $params[':email'] = $data['email'];
    }
    
    if (empty($updateFields)) {
        Response::error('No fields to update', 400);
    }
    
    // Add updated_at
    $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
    
    // Update user
    $query = "UPDATE users SET " . implode(', ', $updateFields) . " 
              WHERE id = :user_id";
    
    $stmt = $db->prepare($query);
    
    if ($stmt->execute($params)) {
        // Get updated user
        $selectQuery = "SELECT id, email, first_name, last_name, phone, role, status, created_at, updated_at 
                       FROM users WHERE id = :user_id";
        $selectStmt = $db->prepare($selectQuery);
        $selectStmt->bindParam(':user_id', $user['id']);
        $selectStmt->execute();
        $updatedUser = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        Response::success([
            'user' => $updatedUser
        ], 'Profile updated successfully');
    } else {
        Response::error('Failed to update profile', 500);
    }
    
} catch (Exception $e) {
    error_log('Update Profile Error: ' . $e->getMessage());
    Response::error('Failed to update profile: ' + $e->getMessage(), 500);
}

