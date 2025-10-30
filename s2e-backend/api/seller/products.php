<?php
/**
 * Seller Products Endpoint
 * GET /api/seller/products - Get seller's products
 */

// CORS headers FIRST - before anything else
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
if (in_array($origin, ['http://localhost:5173', 'http://localhost:5174'])) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Log all headers for debugging
error_log("📡 Headers: " . json_encode(apache_request_headers()));
error_log("📡 Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("📡 Request URI: " . $_SERVER['REQUEST_URI']);
error_log("📡 HTTP_AUTHORIZATION from \$_SERVER: " . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET'));
error_log("📡 REDIRECT_HTTP_AUTHORIZATION: " . ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT SET'));
error_log("📡 All \$_SERVER keys with AUTH: " . json_encode(array_filter(array_keys($_SERVER), function($key) { return strpos($key, 'AUTH') !== false; })));

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_log("❌ Wrong method: " . $_SERVER['REQUEST_METHOD']);
    Response::error('Method not allowed', 405);
}

// FORCE LOGGING
error_log("==================== PRODUCTS ENDPOINT START ====================");
error_log("REQUEST URI: " . $_SERVER['REQUEST_URI']);
error_log("REQUEST METHOD: " . $_SERVER['REQUEST_METHOD']);

// Authenticate seller
try {
    $auth = new Auth();
    $user = $auth->getCurrentUser();
    
    error_log("📡 Auth result: " . json_encode($user));
    
    if (!$user || $user['user_type'] !== 'seller') {
        error_log("❌ Seller auth failed - User: " . json_encode($user));
        error_log("❌ User type: " . ($user ? $user['user_type'] : 'null'));
        Response::unauthorized('Seller access required');
    }
    
    $sellerId = $user['id'];
    error_log("✅✅✅ SELLER ID: $sellerId ✅✅✅");
    error_log("🔍 User email: " . $user['email']);
    error_log("🔍 Business name: " . ($user['business_name'] ?? 'N/A'));
    
    // TEMPORARY DEBUG: Return seller info in response header
    header("X-Debug-Seller-ID: $sellerId");
    
} catch (Exception $e) {
    error_log("❌ Auth exception: " . $e->getMessage());
    error_log("❌ Stack trace: " . $e->getTraceAsString());
    Response::serverError('Authentication error: ' . $e->getMessage());
}

error_log("==================== CONTINUING WITH SELLER ID: $sellerId ====================");

// Get query parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
$status = isset($_GET['status']) ? $_GET['status'] : null;
$search = isset($_GET['search']) ? $_GET['search'] : null;

$offset = ($page - 1) * $limit;

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Build query
$whereConditions = ["p.seller_id = :seller_id"];
$params = [':seller_id' => $sellerId];

if ($status && $status !== 'all') {
    $whereConditions[] = "p.status = :status";
    $params[':status'] = $status;
}

if ($search) {
    $whereConditions[] = "(p.title LIKE :search OR p.description LIKE :search)";
    $params[':search'] = "%{$search}%";
}

$whereClause = implode(' AND ', $whereConditions);

// Get products with category info
$query = "SELECT 
            p.*,
            c.name as category_name,
            c.slug as category_slug
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE {$whereClause}
          ORDER BY p.created_at DESC
          LIMIT :limit OFFSET :offset";

error_log("📡 Seller products query: " . $query);
error_log("📡 Parameters: " . json_encode($params));

try {
    $stmt = $db->prepare($query);

    // Bind parameters
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();
    $products = $stmt->fetchAll();
    
    error_log("✅ Found " . count($products) . " products for seller $sellerId");

    // Parse JSON fields
    foreach ($products as &$product) {
        $product['images'] = json_decode($product['images'] ?? '[]');
        $product['tags'] = json_decode($product['tags'] ?? '[]');
    }
} catch (PDOException $e) {
    error_log("❌ Database error: " . $e->getMessage());
    Response::serverError('Database error: ' . $e->getMessage());
}

// Get total count
$countQuery = "SELECT COUNT(*) as total 
               FROM products p
               WHERE {$whereClause}";

$countStmt = $db->prepare($countQuery);
foreach ($params as $key => $value) {
    $countStmt->bindValue($key, $value);
}
$countStmt->execute();
$total = $countStmt->fetch()['total'];

// Get status counts
$statusCountQuery = "SELECT 
                        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
                        COUNT(CASE WHEN status = 'proposed' THEN 1 END) as proposed,
                        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
                        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
                     FROM products
                     WHERE seller_id = :seller_id";
$statusCountStmt = $db->prepare($statusCountQuery);
$statusCountStmt->bindValue(':seller_id', $sellerId);
$statusCountStmt->execute();
$statusCounts = $statusCountStmt->fetch();

// TEMPORARY DEBUG: Add seller_id to response
Response::success([
    'debug_seller_id' => $sellerId, // TEMPORARY DEBUG
    'products' => $products,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => (int)$total,
        'pages' => ceil($total / $limit)
    ],
    'stats' => [
        'draft' => (int)$statusCounts['draft'],
        'proposed' => (int)$statusCounts['proposed'],
        'published' => (int)$statusCounts['published'],
        'rejected' => (int)$statusCounts['rejected']
    ]
], 'Products fetched successfully');


