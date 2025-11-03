<?php
/**
 * Seller Profile Endpoint
 * GET /api/seller/me - Get current seller's profile
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Authenticate seller
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user || $user['user_type'] !== 'seller') {
    Response::unauthorized('Seller access required');
}

$sellerId = $user['id'];

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Get seller profile with business address
$query = "SELECT 
            s.*,
            a.id as address_id,
            a.address_line_1 as street,
            a.address_line_2,
            a.barangay,
            a.barangay_code,
            a.municipality,
            a.municipality_code,
            a.city,
            a.province,
            a.province_code,
            a.postal_code,
            a.country
          FROM sellers s
          LEFT JOIN addresses a ON s.id = a.seller_id AND a.address_type = 'business'
          WHERE s.id = :seller_id
          LIMIT 1";

$stmt = $db->prepare($query);
$stmt->bindParam(':seller_id', $sellerId);
$stmt->execute();

$seller = $stmt->fetch();

if (!$seller) {
    Response::error('Seller not found', 404);
}

// Remove password from response
unset($seller['password']);

Response::success($seller, 'Seller profile fetched successfully');


