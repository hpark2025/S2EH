<?php
/**
 * Update Address Endpoint
 * PUT /api/addresses/{id}
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

// Get address ID from URL
$addressId = $_GET['id'] ?? null;

if (!$addressId) {
    Response::error('Address ID is required', 400);
}

// Get request body
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    Response::error('Invalid request data', 400);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Verify the address belongs to the user
    $checkQuery = "SELECT id FROM addresses WHERE id = :id AND user_id = :user_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $addressId);
    $checkStmt->bindParam(':user_id', $user['id']);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        Response::error('Address not found or unauthorized', 404);
    }
    
    // Build update query dynamically based on provided fields
    $updateFields = [];
    $params = [':id' => $addressId, ':user_id' => $user['id']];
    
    if (isset($data['street'])) {
        $updateFields[] = "address_line_1 = :address_line_1";
        $params[':address_line_1'] = $data['street'];
    }
    
    if (isset($data['barangay'])) {
        $updateFields[] = "barangay = :barangay";
        $params[':barangay'] = $data['barangay'];
    }
    
    if (isset($data['municipality'])) {
        $updateFields[] = "municipality = :municipality";
        $updateFields[] = "city = :city";
        $params[':municipality'] = $data['municipality'];
        $params[':city'] = $data['municipality'];
    }
    
    if (isset($data['province'])) {
        $updateFields[] = "province = :province";
        $params[':province'] = $data['province'];
    }
    
    if (isset($data['postalCode'])) {
        $updateFields[] = "postal_code = :postal_code";
        $params[':postal_code'] = $data['postalCode'];
    }
    
    if (empty($updateFields)) {
        Response::error('No fields to update', 400);
    }
    
    // Add updated_at
    $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
    
    // Update address
    $query = "UPDATE addresses SET " . implode(', ', $updateFields) . " 
              WHERE id = :id AND user_id = :user_id";
    
    $stmt = $db->prepare($query);
    
    if ($stmt->execute($params)) {
        // Get updated address
        $selectQuery = "SELECT * FROM addresses WHERE id = :id";
        $selectStmt = $db->prepare($selectQuery);
        $selectStmt->bindParam(':id', $addressId);
        $selectStmt->execute();
        $address = $selectStmt->fetch(PDO::FETCH_ASSOC);
        
        Response::success([
            'address' => $address
        ], 'Address updated successfully');
    } else {
        Response::error('Failed to update address', 500);
    }
    
} catch (Exception $e) {
    error_log('Update Address Error: ' . $e->getMessage());
    Response::error('Failed to update address: ' . $e->getMessage(), 500);
}

