<?php
// Simple products endpoint with authentication

// Dynamic CORS for both dev ports
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: http://localhost:5173');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log("📡 SIMPLE.PHP - OPTIONS preflight from: " . ($origin ?: 'unknown'));
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/Auth.php';
require_once __DIR__ . '/helpers/Response.php';

$database = new Database();
$db = $database->getConnection();

// Get authenticated seller
try {
    // DEBUG: Log headers
    $headers = apache_request_headers();
    error_log("📡 SIMPLE.PHP - All headers: " . json_encode($headers));
    error_log("📡 SIMPLE.PHP - Authorization header: " . ($headers['Authorization'] ?? 'NOT FOUND'));
    
    $auth = new Auth();
    $user = $auth->getCurrentUser();
    
    error_log("📡 SIMPLE.PHP - User result: " . json_encode($user));
    
    if (!$user || $user['user_type'] !== 'seller') {
        error_log("❌ SIMPLE.PHP - Auth failed. User: " . json_encode($user));
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Seller access required']);
        exit();
    }
    
    $sellerId = $user['id'];
    error_log("✅✅✅ SIMPLE.PHP - SELLER ID: $sellerId ✅✅✅");
} catch (Exception $e) {
    error_log("❌ SIMPLE.PHP - Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Authentication error: ' . $e->getMessage()]);
    exit();
}

$query = "SELECT * FROM products WHERE seller_id = :seller_id ORDER BY created_at DESC";
$stmt = $db->prepare($query);
$stmt->bindParam(':seller_id', $sellerId);
$stmt->execute();
$products = $stmt->fetchAll();

// Parse JSON fields
foreach ($products as &$product) {
    $product['images'] = json_decode($product['images'] ?? '[]');
    $product['tags'] = json_decode($product['tags'] ?? '[]');
}

echo json_encode([
    'success' => true,
    'message' => 'Products fetched successfully',
    'data' => [
        'products' => $products,
        'pagination' => ['page' => 1, 'limit' => 100, 'total' => count($products), 'pages' => 1],
        'stats' => ['draft' => 0, 'proposed' => count($products), 'published' => 0, 'rejected' => 0]
    ]
]);

