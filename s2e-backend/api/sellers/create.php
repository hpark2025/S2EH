<?php
/**
 * Create Seller Endpoint (Admin only)
 * POST /api/sellers/create - Admin creates a new seller
 */

// Set CORS headers FIRST - support both port 5173 and 5174
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5174';
if (in_array($origin, ['http://localhost:5173', 'http://localhost:5174'])) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:5174");
}
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

// Verify admin authentication
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user || $user['user_type'] !== 'admin') {
    Response::unauthorized('Admin access required');
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['email', 'password', 'business_name', 'business_type', 'owner_name', 'phone', 'province', 'municipality', 'barangay'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        Response::error("Missing required field: $field", 400);
    }
}

try {
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Start transaction
    $db->beginTransaction();
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM sellers WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        $db->rollBack();
        Response::error('Email already exists', 400);
    }
    
    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insert seller
    $stmt = $db->prepare("
        INSERT INTO sellers (
            email, 
            password, 
            business_name, 
            owner_name, 
            phone, 
            business_type, 
            business_description,
            business_permit,
            verification_status, 
            status,
            created_at, 
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'verified', 'active', NOW(), NOW())
    ");
    
    $stmt->execute([
        $data['email'],
        $hashedPassword,
        $data['business_name'],
        $data['owner_name'],
        $data['phone'],
        $data['business_type'],
        $data['business_description'] ?? null,
        $data['business_permit'] ?? null
    ]);
    
    $sellerId = $db->lastInsertId();
    
    // Insert business address with PSGC codes
    $stmt = $db->prepare("
        INSERT INTO addresses (
            seller_id,
            address_type,
            province,
            province_code,
            municipality,
            municipality_code,
            city,
            barangay,
            barangay_code,
            created_at,
            updated_at
        ) VALUES (?, 'business', ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");
    
    $stmt->execute([
        $sellerId,
        $data['province'],
        $data['province_code'] ?? null,
        $data['municipality'],
        $data['municipality_code'] ?? null,
        $data['municipality'], // city same as municipality
        $data['barangay'],
        $data['barangay_code'] ?? null
    ]);
    
    // Commit transaction
    $db->commit();
    
    // Fetch the created seller
    $stmt = $db->prepare("
        SELECT 
            s.*,
            a.province,
            a.municipality,
            a.barangay
        FROM sellers s
        LEFT JOIN addresses a ON s.id = a.seller_id AND a.address_type = 'business'
        WHERE s.id = ?
    ");
    $stmt->execute([$sellerId]);
    $seller = $stmt->fetch(PDO::FETCH_ASSOC);
    
    Response::success('Seller created successfully', [
        'seller' => $seller
    ]);
    
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Create seller error: " . $e->getMessage());
    Response::error('Failed to create seller: ' . $e->getMessage(), 500);
}

