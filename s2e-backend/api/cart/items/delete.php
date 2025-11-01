<?php
/**
 * Delete Cart Item
 * DELETE /api/cart/items/{id}
 */

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../helpers/Response.php';
require_once __DIR__ . '/../../../helpers/Auth.php';

// Only accept DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

// Verify cart item belongs to user
$query = "SELECT ci.id
          FROM cart_items ci
          JOIN carts c ON ci.cart_id = c.id
          WHERE ci.id = :item_id AND c.user_id = :user_id";
$stmt = $db->prepare($query);
$stmt->bindParam(':item_id', $itemId);
$stmt->bindParam(':user_id', $userId);
$stmt->execute();
$item = $stmt->fetch();

if (!$item) {
    Response::error('Cart item not found', 404);
}

// Delete cart item
$query = "DELETE FROM cart_items WHERE id = :id";
$stmt = $db->prepare($query);
$stmt->bindParam(':id', $itemId);
$stmt->execute();

Response::success([
    'message' => 'Cart item removed successfully'
]);

