<?php
/**
 * Seller Stock Locations API
 * Manages seller's stock locations using addresses table
 */

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';

// TEMPORARY: Disable auth for testing
// TODO: Re-enable authentication after testing
$sellerId = 10; // Hardcoded for testing

try {
    $database = new Database();
    $db = $database->getConnection();

    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            // Get all stock locations for seller
            error_log('📍 Fetching stock locations for seller_id: ' . $sellerId);
            
            $query = "SELECT 
                        id,
                        address_line_1 as name,
                        barangay,
                        barangay_code,
                        municipality,
                        municipality_code,
                        province,
                        province_code,
                        postal_code,
                        is_default,
                        created_at,
                        updated_at
                      FROM addresses 
                      WHERE seller_id = :seller_id 
                      AND user_id IS NULL
                      AND address_type = 'business'
                      ORDER BY is_default DESC, created_at DESC";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':seller_id', $sellerId, PDO::PARAM_INT);
            $stmt->execute();
            
            $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log('📍 Found ' . count($locations) . ' stock locations');
            
            // Format for frontend (Medusa-style structure)
            $formatted = array_map(function($loc) {
                return [
                    'id' => $loc['id'],
                    'name' => $loc['name'],
                    'address' => [
                        'address_1' => $loc['barangay'],
                        'city' => $loc['municipality'],
                        'province' => $loc['province'],
                        'postal_code' => $loc['postal_code'],
                        'country_code' => 'ph'
                    ],
                    'metadata' => [
                        'status' => 'active',
                        'barangay_code' => $loc['barangay_code'],
                        'municipality_code' => $loc['municipality_code'],
                        'province_code' => $loc['province_code']
                    ],
                    'created_at' => $loc['created_at']
                ];
            }, $locations);
            
            Response::success('Stock locations fetched successfully', [
                'stock_locations' => $formatted,
                'count' => count($formatted)
            ]);
            break;

        case 'POST':
            // Create new stock location
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['address'])) {
                Response::error('Name and address are required', 400);
            }
            
            $name = $data['name'];
            $address = $data['address'];
            
            $query = "INSERT INTO addresses (
                        seller_id,
                        address_type,
                        address_line_1,
                        barangay,
                        municipality,
                        province,
                        postal_code,
                        country
                      ) VALUES (
                        :seller_id,
                        'business',
                        :name,
                        :barangay,
                        :municipality,
                        :province,
                        :postal_code,
                        'Philippines'
                      )";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':seller_id', $sellerId);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':barangay', $address['address_1']);
            $stmt->bindParam(':municipality', $address['city']);
            $stmt->bindParam(':province', $address['province']);
            $stmt->bindParam(':postal_code', $address['postal_code']);
            
            if ($stmt->execute()) {
                $newId = $db->lastInsertId();
                Response::success('Stock location created successfully', [
                    'id' => $newId
                ], 201);
            } else {
                Response::error('Failed to create stock location', 500);
            }
            break;

        case 'PUT':
            // Update stock location
            // Get ID from URL
            $uri = $_SERVER['REQUEST_URI'];
            preg_match('/\/stock-locations\/(\d+)/', $uri, $matches);
            $locationId = $matches[1] ?? null;
            
            if (!$locationId) {
                Response::error('Location ID is required', 400);
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['address'])) {
                Response::error('Name and address are required', 400);
            }
            
            $name = $data['name'];
            $address = $data['address'];
            
            $query = "UPDATE addresses SET
                        address_line_1 = :name,
                        barangay = :barangay,
                        municipality = :municipality,
                        province = :province,
                        postal_code = :postal_code,
                        updated_at = NOW()
                      WHERE id = :id 
                      AND seller_id = :seller_id 
                      AND user_id IS NULL
                      AND address_type = 'business'";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $locationId);
            $stmt->bindParam(':seller_id', $sellerId);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':barangay', $address['address_1']);
            $stmt->bindParam(':municipality', $address['city']);
            $stmt->bindParam(':province', $address['province']);
            $stmt->bindParam(':postal_code', $address['postal_code']);
            
            if ($stmt->execute()) {
                Response::success(['id' => $locationId], 'Stock location updated successfully');
            } else {
                Response::error('Failed to update stock location', 500);
            }
            break;

        case 'DELETE':
            // Delete stock location
            $uri = $_SERVER['REQUEST_URI'];
            preg_match('/\/stock-locations\/(\d+)/', $uri, $matches);
            $locationId = $matches[1] ?? null;
            
            if (!$locationId) {
                Response::error('Location ID is required', 400);
            }
            
            $query = "DELETE FROM addresses 
                      WHERE id = :id 
                      AND seller_id = :seller_id 
                      AND user_id IS NULL
                      AND address_type = 'business'";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $locationId);
            $stmt->bindParam(':seller_id', $sellerId);
            
            if ($stmt->execute()) {
                Response::success(['id' => $locationId], 'Stock location deleted successfully');
            } else {
                Response::error('Failed to delete stock location', 500);
            }
            break;

        default:
            Response::error('Method not allowed', 405);
    }

} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    Response::error('Database error: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    Response::error('An error occurred: ' . $e->getMessage(), 500);
}

