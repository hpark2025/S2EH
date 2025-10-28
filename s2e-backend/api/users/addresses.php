<?php
// Explicit CORS headers at the very top
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../utils/Response.php';

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get user ID from URL
$uri = $_SERVER['REQUEST_URI'];
preg_match('/\/users\/(\d+)\/addresses/', $uri, $matches);
$userId = $matches[1] ?? null;

if (!$userId) {
    Response::error('User ID is required', 400);
    exit();
}

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Fetch user addresses
    $query = "SELECT 
                id,
                user_id,
                address_line_1,
                address_line_2,
                barangay,
                barangay_code,
                municipality,
                municipality_code,
                province,
                province_code,
                postal_code,
                is_default,
                created_at
              FROM addresses 
              WHERE user_id = :user_id
              ORDER BY is_default DESC, created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->execute();

    $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert is_default to boolean
    foreach ($addresses as &$address) {
        $address['is_default'] = (bool)$address['is_default'];
    }

    error_log('📍 Fetched ' . count($addresses) . ' addresses for user ' . $userId);

    Response::success('Addresses fetched successfully', $addresses);

} catch (PDOException $e) {
    error_log('❌ Database error: ' . $e->getMessage());
    Response::error('Failed to fetch addresses: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log('❌ Error: ' . $e->getMessage());
    Response::error('An error occurred: ' . $e->getMessage(), 500);
}

