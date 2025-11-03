<?php
/**
 * Users API Endpoint (Admin only)
 * GET /api/users - Get all users/customers for admin
 */

// Set CORS headers FIRST - simple wildcard for admin endpoints
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Admin-Token");
header("Access-Control-Max-Age: 86400"); // Cache preflight for 24 hours
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight - MUST return 200 with CORS headers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit();
}

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

try {
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Get query parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $status = $_GET['status'] ?? null;
    $search = $_GET['search'] ?? null;
    
    $offset = ($page - 1) * $limit;
    
    // Build query
    $whereConditions = [];
    $params = [];
    
    if ($status) {
        $whereConditions[] = "u.status = ?";
        $params[] = $status;
    }
    
    if ($search) {
        $whereConditions[] = "(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
    
    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM users u $whereClause";
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute($params);
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get users with address information, orders count, and total spent
    $query = "
        SELECT 
            u.id,
            u.email,
            u.first_name,
            u.last_name,
            u.phone,
            u.role,
            u.status,
            u.email_verified,
            u.created_at,
            u.updated_at,
            u.last_login,
            a.province,
            a.municipality,
            a.barangay,
            COALESCE((
                SELECT COUNT(*)
                FROM orders
                WHERE user_id = u.id
            ), 0) as orders_count,
            COALESCE((
                SELECT SUM(total)
                FROM orders
                WHERE user_id = u.id
            ), 0) as total_spent
        FROM users u
        LEFT JOIN addresses a ON u.id = a.user_id AND a.address_type = 'shipping'
        $whereClause
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get stats
    $statsQuery = "
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended
        FROM users
    ";
    $statsStmt = $db->prepare($statsQuery);
    $statsStmt->execute();
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    Response::success([
        'users' => $users,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$totalCount,
            'pages' => ceil($totalCount / $limit)
        ],
        'stats' => [
            'total' => (int)$stats['total'],
            'active' => (int)$stats['active'],
            'pending' => (int)$stats['pending'],
            'suspended' => (int)$stats['suspended']
        ]
    ], 'Users fetched successfully');
    
} catch (Exception $e) {
    error_log("Fetch users error: " . $e->getMessage());
    Response::error('Failed to fetch users: ' . $e->getMessage(), 500);
}

