<?php
/**
 * Sellers API Endpoint (Admin only)
 * GET /api/sellers - Get all sellers for admin approval
 */

// Set CORS headers FIRST - simple wildcard for admin endpoints
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// TEMPORARY: Disable auth for testing
// TODO: Re-enable authentication after testing
/*
$auth = new Auth();
$user = $auth->getCurrentUser();

error_log("Sellers API - Current user: " . json_encode($user));

if (!$user || $user['user_type'] !== 'admin') {
    error_log("Sellers API - Authentication failed. User: " . json_encode($user));
    Response::unauthorized('Admin access required');
}
*/

// Get query parameters
$status = isset($_GET['status']) ? $_GET['status'] : null;
$verification_status = isset($_GET['verification_status']) ? $_GET['verification_status'] : null;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

$offset = ($page - 1) * $limit;

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Build query
$whereConditions = [];
$params = [];

if ($status) {
    $whereConditions[] = "status = :status";
    $params[':status'] = $status;
}

if ($verification_status) {
    $whereConditions[] = "verification_status = :verification_status";
    $params[':verification_status'] = $verification_status;
}

$whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

// Get sellers with address info
$query = "SELECT 
            s.*,
            a.province,
            a.city as municipality,
            a.barangay
          FROM sellers s
          LEFT JOIN addresses a ON s.id = a.seller_id AND a.address_type = 'business'
          {$whereClause}
          ORDER BY 
            CASE s.verification_status
                WHEN 'pending' THEN 1
                WHEN 'verified' THEN 2
                WHEN 'rejected' THEN 3
            END,
            s.created_at DESC
          LIMIT :limit OFFSET :offset";

$stmt = $db->prepare($query);

// Bind parameters
foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

$stmt->execute();
$sellers = $stmt->fetchAll();

// Remove passwords from response
foreach ($sellers as &$seller) {
    unset($seller['password']);
}

// Get total count
$countQuery = "SELECT COUNT(*) as total FROM sellers s {$whereClause}";
$countStmt = $db->prepare($countQuery);
foreach ($params as $key => $value) {
    $countStmt->bindValue($key, $value);
}
$countStmt->execute();
$total = $countStmt->fetch()['total'];

// Get counts by verification status
$statsQuery = "SELECT 
    verification_status,
    COUNT(*) as count
FROM sellers
GROUP BY verification_status";
$statsStmt = $db->query($statsQuery);
$stats = [];
while ($row = $statsStmt->fetch()) {
    $stats[$row['verification_status']] = (int)$row['count'];
}

Response::success([
    'sellers' => $sellers,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => (int)$total,
        'pages' => ceil($total / $limit)
    ],
    'stats' => [
        'pending' => $stats['pending'] ?? 0,
        'verified' => $stats['verified'] ?? 0,
        'rejected' => $stats['rejected'] ?? 0,
        'total' => array_sum($stats)
    ]
]);

