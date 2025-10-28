<?php
/**
 * Products API Endpoint
 * GET /api/products - Get all products (public)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Get query parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
$category = isset($_GET['category']) ? $_GET['category'] : null;
$search = isset($_GET['search']) ? $_GET['search'] : null;
$seller_id = isset($_GET['seller_id']) ? (int)$_GET['seller_id'] : null;

$offset = ($page - 1) * $limit;

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Build query - Only show published products to customers
$whereConditions = ["p.status = 'published'"];
$params = [];

if ($category) {
    $whereConditions[] = "c.slug = :category";
    $params[':category'] = $category;
}

if ($search) {
    $whereConditions[] = "(p.title LIKE :search OR p.description LIKE :search)";
    $params[':search'] = "%{$search}%";
}

if ($seller_id) {
    $whereConditions[] = "p.seller_id = :seller_id";
    $params[':seller_id'] = $seller_id;
}

$whereClause = implode(' AND ', $whereConditions);

// Get products with seller and category info
$query = "SELECT 
            p.*,
            c.name as category_name,
            c.slug as category_slug,
            s.business_name as seller_name,
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

$stmt->execute();
$products = $stmt->fetchAll();

// Parse JSON fields
foreach ($products as &$product) {
    $product['images'] = json_decode($product['images'] ?? '[]');
    $product['tags'] = json_decode($product['tags'] ?? '[]');
}

// Get total count
$countQuery = "SELECT COUNT(*) as total 
               FROM products p
               LEFT JOIN categories c ON p.category_id = c.id
               WHERE {$whereClause}";

$countStmt = $db->prepare($countQuery);
foreach ($params as $key => $value) {
    $countStmt->bindValue($key, $value);
}
$countStmt->execute();
$total = $countStmt->fetch()['total'];

Response::success([
    'products' => $products,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => (int)$total,
        'pages' => ceil($total / $limit)
    ]
]);

