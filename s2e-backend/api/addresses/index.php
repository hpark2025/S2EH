<?php
/**
 * Addresses API Endpoint
 * GET /api/addresses - Get user addresses
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Authenticate user
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user) {
    Response::unauthorized();
}

try {
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Get user addresses
    $query = "SELECT 
                id,
                address_type,
                first_name,
                last_name,
                phone,
                address_line_1,
                address_line_2,
                barangay,
                barangay_code,
                municipality,
                municipality_code,
                city,
                province,
                province_code,
                postal_code,
                country,
                is_default,
                created_at,
                updated_at
              FROM addresses
              WHERE user_id = :user_id
              ORDER BY is_default DESC, created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();
    
    $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    Response::success([
        'addresses' => $addresses,
        'count' => count($addresses)
    ]);
    
} catch (Exception $e) {
    error_log('Addresses API Error: ' . $e->getMessage());
    Response::error('Failed to fetch addresses: ' . $e->getMessage(), 500);
}

