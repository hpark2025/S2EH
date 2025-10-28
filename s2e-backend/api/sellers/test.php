<?php
/**
 * Test endpoint to check sellers data
 */

require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get all sellers with addresses
    $query = "SELECT 
                s.id,
                s.business_name,
                s.owner_name,
                s.email,
                s.phone,
                s.business_type,
                s.verification_status,
                s.status,
                s.created_at,
                a.province,
                a.city as municipality,
                a.barangay
              FROM sellers s
              LEFT JOIN addresses a ON s.id = a.seller_id AND a.address_type = 'business'
              ORDER BY s.created_at DESC";
    
    $stmt = $db->query($query);
    $sellers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'count' => count($sellers),
        'sellers' => $sellers
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}

