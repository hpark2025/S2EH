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
    
    // Verify the address belongs to the user or seller
    $checkQuery = "SELECT id, user_id, seller_id FROM addresses WHERE id = :id AND (user_id = :user_id OR seller_id = :seller_id)";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $addressId);
    $checkStmt->bindParam(':user_id', $user['id']);
    $checkStmt->bindParam(':seller_id', $user['id']);
    $checkStmt->execute();
    $addressCheck = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$addressCheck) {
        Response::error('Address not found or unauthorized', 404);
    }
    
    // Build update query dynamically based on provided fields
    $updateFields = [];
    $params = [':id' => $addressId];
    
    if (isset($data['street'])) {
        $updateFields[] = "address_line_1 = :address_line_1";
        $params[':address_line_1'] = $data['street'];
    }
    
    if (isset($data['barangay'])) {
        $updateFields[] = "barangay = :barangay";
        $params[':barangay'] = $data['barangay'];
    }
    
    if (isset($data['barangayCode'])) {
        $updateFields[] = "barangay_code = :barangay_code";
        $params[':barangay_code'] = $data['barangayCode'];
    }
    
    if (isset($data['municipality'])) {
        $updateFields[] = "municipality = :municipality";
        $updateFields[] = "city = :city";
        $params[':municipality'] = $data['municipality'];
        $params[':city'] = $data['municipality'];
    }
    
    if (isset($data['municipalityCode'])) {
        $updateFields[] = "municipality_code = :municipality_code";
        $params[':municipality_code'] = $data['municipalityCode'];
    }
    
    if (isset($data['province'])) {
        $updateFields[] = "province = :province";
        $params[':province'] = $data['province'];
    }
    
    if (isset($data['provinceCode'])) {
        $updateFields[] = "province_code = :province_code";
        $params[':province_code'] = $data['provinceCode'];
    }
    
    if (isset($data['postalCode']) || isset($data['postal_code'])) {
        $updateFields[] = "postal_code = :postal_code";
        $params[':postal_code'] = $data['postalCode'] ?? $data['postal_code'];
    }
    
    if (empty($updateFields)) {
        Response::error('No fields to update', 400);
    }
    
    // Add updated_at
    $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
    
    // Update address - check both user_id and seller_id
    $whereClause = "WHERE id = :id AND (user_id = :user_id OR seller_id = :seller_id)";
    $params[':user_id'] = $user['id'];
    $params[':seller_id'] = $user['id'];
    
    $query = "UPDATE addresses SET " . implode(', ', $updateFields) . " " . $whereClause;
    
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

