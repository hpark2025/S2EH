<?php
/**
 * Admin Products Endpoint
 * GET /api/products/admin - Get products for admin review (proposed, approved, rejected)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// TEMPORARY: Disable auth for testing
// TODO: Re-enable authentication after testing
/*
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user || $user['user_type'] !== 'admin') {
    Response::unauthorized('Admin access required');
}
*/

// Get query parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
$status = isset($_GET['status']) && $_GET['status'] !== '' && $_GET['status'] !== 'null' ? $_GET['status'] : null; // Allow filtering by status
$search = isset($_GET['search']) ? $_GET['search'] : null;
$seller_id = isset($_GET['seller_id']) ? (int)$_GET['seller_id'] : null;

$offset = ($page - 1) * $limit;

error_log("📡 Received status param: " . var_export($_GET['status'] ?? 'NOT SET', true));
error_log("📡 Final status value: " . var_export($status, true));

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Build query - Admin can see proposed, approved, rejected products
$whereConditions = [];
$params = [];

// Filter by status (proposed, published, rejected, or all)
if ($status && $status !== 'all') {
    $whereConditions[] = "p.status = :status";
    $params[':status'] = $status;
} else {
    // Show proposed, published, rejected (exclude draft and archived)
    $whereConditions[] = "p.status IN ('proposed', 'published', 'rejected')";
}

if ($search) {
    $whereConditions[] = "(p.title LIKE :search OR p.description LIKE :search OR s.business_name LIKE :search)";
    $params[':search'] = "%{$search}%";
}

if ($seller_id) {
    $whereConditions[] = "p.seller_id = :seller_id";
    $params[':seller_id'] = $seller_id;
}

$whereClause = count($whereConditions) > 0 ? implode(' AND ', $whereConditions) : '1=1';

// Get products with seller and category info
$query = "SELECT 
            p.*,
            c.name as category_name,
            c.slug as category_slug,
            s.business_name as seller_name,
            s.owner_name as seller_owner_name,
            s.email as seller_email,
            s.phone as seller_phone,
            s.id as seller_id
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN sellers s ON p.seller_id = s.id
          WHERE {$whereClause}
          ORDER BY p.created_at DESC
          LIMIT :limit OFFSET :offset";

$stmt = $db->prepare($query);

// Bind parameters
foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

error_log("📡 Admin products query: " . $query);
error_log("📡 Admin products params: " . json_encode($params));
error_log("📡 Where clause: " . $whereClause);

$stmt->execute();
$products = $stmt->fetchAll();

error_log("✅ Found " . count($products) . " products");
if (count($products) > 0) {
    error_log("✅ First product: " . json_encode($products[0]));
}

// Parse JSON fields
foreach ($products as &$product) {
    $product['images'] = json_decode($product['images'] ?? '[]');
    $product['tags'] = json_decode($product['tags'] ?? '[]');
}

// Get total count
$countQuery = "SELECT COUNT(*) as total 
               FROM products p
               LEFT JOIN categories c ON p.category_id = c.id
               LEFT JOIN sellers s ON p.seller_id = s.id
               WHERE {$whereClause}";

$countStmt = $db->prepare($countQuery);
foreach ($params as $key => $value) {
    $countStmt->bindValue($key, $value);
}
$countStmt->execute();
$total = $countStmt->fetch()['total'];

// Get status counts for filters
$statusCountQuery = "SELECT 
                        COUNT(CASE WHEN status = 'proposed' THEN 1 END) as proposed,
                        COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
                        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
                     FROM products";
$statusCountStmt = $db->prepare($statusCountQuery);
$statusCountStmt->execute();
$statusCounts = $statusCountStmt->fetch();

Response::success([
    'products' => $products,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => (int)$total,
        'pages' => ceil($total / $limit)
    ],
    'stats' => [
        'proposed' => (int)$statusCounts['proposed'],
        'published' => (int)$statusCounts['published'],
        'rejected' => (int)$statusCounts['rejected']
    ]
], 'Products fetched successfully');


