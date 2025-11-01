<?php
/**
 * Update Cart Item
 * PUT/PATCH /api/cart/items/{id}
 */

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../helpers/Response.php';
require_once __DIR__ . '/../../../helpers/Auth.php';

// Only accept PUT, PATCH requests
if (!in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'PATCH'])) {
    Response::error('Method not allowed', 405);
}

// Get authenticated user
$database = new Database();
$db = $database->getConnection();

$auth = new Auth();
$user = $auth->getCurrentUser();
if (!$user) {
    Response::error('Unauthorized', 401);
}

$userId = $user['id'];

// Get cart item ID from URL
$itemId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$itemId) {
    Response::error('Cart item ID is required', 400);
}

// Get request data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['quantity'])) {
    Response::error('Quantity is required', 400);
}

$quantity = (int)$data['quantity'];

if ($quantity < 1) {
    Response::error('Quantity must be at least 1', 400);
}

// Verify cart item belongs to user
$query = "SELECT ci.*, p.stock_quantity
          FROM cart_items ci
          JOIN carts c ON ci.cart_id = c.id
          JOIN products p ON ci.product_id = p.id
          WHERE ci.id = :item_id AND c.user_id = :user_id";
$stmt = $db->prepare($query);
$stmt->bindParam(':item_id', $itemId);
$stmt->bindParam(':user_id', $userId);
$stmt->execute();
$item = $stmt->fetch();

if (!$item) {
    Response::error('Cart item not found', 404);
}

// Check stock
if ($item['stock_quantity'] < $quantity) {
    Response::error('Insufficient stock', 400);
}

// Update quantity
$query = "UPDATE cart_items SET quantity = :quantity WHERE id = :id";
$stmt = $db->prepare($query);
$stmt->bindParam(':quantity', $quantity);
$stmt->bindParam(':id', $itemId);
$stmt->execute();

Response::success([
    'message' => 'Cart item updated successfully',
    'cart_item_id' => $itemId,
    'quantity' => $quantity
]);

