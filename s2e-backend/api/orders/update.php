<?php
/**
 * Update Order Status Endpoint (Seller only)
 * PUT /api/orders/update.php?id={order_id}
 * or PUT /seller/orders/{id} (if routed)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept PUT requests
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Response::error('Method not allowed', 405);
}

// Authenticate seller
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user || $user['user_type'] !== 'seller') {
    Response::unauthorized('Seller access required');
}

// Get order ID from URL or query string
$orderId = null;

// Try query string first (from .htaccess rewrite)
if (isset($_GET['id'])) {
    $orderId = $_GET['id'];
}

// Try to get from URL path (e.g., /seller/orders/1)
if (!$orderId) {
    $uri = $_SERVER['REQUEST_URI'];
    // Remove query string if present
    $uri = strtok($uri, '?');
    $uriParts = explode('/', trim($uri, '/'));
    
    error_log('📦 URI: ' . $uri);
    error_log('📦 URI Parts: ' . json_encode($uriParts));
    
    if (in_array('orders', $uriParts)) {
        $ordersIndex = array_search('orders', $uriParts);
        if (isset($uriParts[$ordersIndex + 1])) {
            $orderId = $uriParts[$ordersIndex + 1];
        }
    }
}

// Clean and validate order ID
if ($orderId) {
    $orderId = trim($orderId);
    // Remove any query parameters if present
    $orderId = strtok($orderId, '?');
}

if (!$orderId || !is_numeric($orderId)) {
    error_log('❌ Invalid order ID - Received: ' . var_export($orderId, true));
    error_log('❌ REQUEST_URI: ' . $_SERVER['REQUEST_URI']);
    error_log('❌ GET params: ' . json_encode($_GET));
    Response::error('Invalid order ID: ' . ($orderId ?? 'not provided'), 400);
}

$orderId = (int)$orderId;
error_log('✅ Parsed order ID: ' . $orderId);

// Get posted data
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

// Log for debugging
error_log('📦 Update order request - Order ID: ' . $orderId);
error_log('📦 Update order request - Raw input: ' . $rawInput);
error_log('📦 Update order request - Parsed data: ' . json_encode($data));

if (!isset($data['status'])) {
    Response::validationError(['status' => 'Status is required']);
}

$newStatus = trim($data['status']);

// Validate status
$validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
if (!in_array($newStatus, $validStatuses)) {
    Response::validationError(['status' => 'Invalid status. Allowed: ' . implode(', ', $validStatuses)]);
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Verify order belongs to this seller
$checkQuery = "SELECT id, status, seller_id FROM orders WHERE id = :id AND seller_id = :seller_id";
$checkStmt = $db->prepare($checkQuery);
$checkStmt->bindParam(':id', $orderId, PDO::PARAM_INT);
$checkStmt->bindParam(':seller_id', $user['id'], PDO::PARAM_INT);
$checkStmt->execute();

$order = $checkStmt->fetch(PDO::FETCH_ASSOC);

if (!$order) {
    Response::error('Order not found or you do not have permission to update it', 404);
}

// Validate status transition
$currentStatus = $order['status'];
$validTransitions = [
    'pending' => ['confirmed', 'cancelled'],
    'confirmed' => ['processing', 'cancelled'],
    'processing' => ['shipped', 'cancelled'],
    'shipped' => ['delivered'],
    'delivered' => [],
    'cancelled' => [],
    'refunded' => []
];

if (!in_array($newStatus, $validTransitions[$currentStatus] ?? [])) {
    Response::error("Invalid status transition from '{$currentStatus}' to '{$newStatus}'", 400);
}

// Build update query
$updateFields = ['status = :status'];
$updateParams = [
    ':id' => $orderId,
    ':status' => $newStatus
];

// Set timestamp based on status
if ($newStatus === 'shipped') {
    $updateFields[] = 'shipped_at = NOW()';
    // If tracking number provided
    if (isset($data['tracking_number'])) {
        $updateFields[] = 'tracking_number = :tracking_number';
        $updateParams[':tracking_number'] = $data['tracking_number'];
    }
} elseif ($newStatus === 'delivered') {
    $updateFields[] = 'delivered_at = NOW()';
} elseif ($newStatus === 'cancelled') {
    $updateFields[] = 'cancelled_at = NOW()';
}

$updateFields[] = 'updated_at = NOW()';

$updateQuery = "UPDATE orders SET " . implode(', ', $updateFields) . " WHERE id = :id";
$updateStmt = $db->prepare($updateQuery);

foreach ($updateParams as $key => $value) {
    $updateStmt->bindValue($key, $value);
}

try {
    if ($updateStmt->execute()) {
        // Get updated order
        $getOrderQuery = "SELECT * FROM orders WHERE id = :id";
        $getOrderStmt = $db->prepare($getOrderQuery);
        $getOrderStmt->bindParam(':id', $orderId, PDO::PARAM_INT);
        $getOrderStmt->execute();
        $updatedOrder = $getOrderStmt->fetch(PDO::FETCH_ASSOC);
        
        error_log('✅ Order status updated successfully - Order ID: ' . $orderId . ', New Status: ' . $newStatus);
        Response::success($updatedOrder, 'Order status updated successfully');
    } else {
        $errorInfo = $updateStmt->errorInfo();
        error_log('❌ Failed to update order status - Order ID: ' . $orderId . ', Error: ' . json_encode($errorInfo));
        Response::error('Failed to update order status: ' . ($errorInfo[2] ?? 'Unknown error'), 500);
    }
} catch (PDOException $e) {
    error_log('❌ Database error updating order status - Order ID: ' . $orderId . ', Error: ' . $e->getMessage());
    Response::error('Database error: ' . $e->getMessage(), 500);
}
