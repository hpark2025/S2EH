<?php
/**
 * Cart API Endpoint
 * GET /api/cart - Get user's cart
 * POST /api/cart - Add item to cart
 * DELETE /api/cart - Clear cart
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
error_log('Cart API - Request method: ' . $method);
error_log('Cart API - Request URI: ' . $_SERVER['REQUEST_URI']);
error_log('Cart API - Headers: ' . print_r(apache_request_headers(), true));

switch ($method) {
    case 'GET':
        error_log('Cart API - Handling GET request');
        getCart($db);
        break;
    case 'POST':
        error_log('Cart API - Handling POST request');
        addToCart($db);
        break;
    case 'DELETE':
        error_log('Cart API - Handling DELETE request');
        clearCart($db);
        break;
    default:
        Response::error('Method not allowed', 405);
}

/**
 * Get user's cart with items
 */
function getCart($db) {
    // Get authenticated user
    $auth = new Auth();
    $user = $auth->getCurrentUser();
    if (!$user) {
        Response::error('Unauthorized', 401);
    }
    
    $userId = $user['id'];
    
    // Get or create cart for user
    $cartId = getOrCreateCart($db, $userId);
    
    // Get cart items with product and seller details
    $query = "SELECT 
                ci.*,
                p.title as product_name,
                p.thumbnail as product_image,
                p.price as current_price,
                p.stock_quantity,
                p.sku as product_sku,
                s.business_name as seller_name
              FROM cart_items ci
              JOIN products p ON ci.product_id = p.id
              JOIN sellers s ON ci.seller_id = s.id
              WHERE ci.cart_id = :cart_id
              ORDER BY ci.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':cart_id', $cartId);
    $stmt->execute();
    
    $items = $stmt->fetchAll();
    
    // Calculate totals
    $subtotal = 0;
    foreach ($items as &$item) {
        $itemTotal = $item['price'] * $item['quantity'];
        $item['total'] = $itemTotal;
        $subtotal += $itemTotal;
    }
    
    Response::success([
        'cart_id' => $cartId,
        'items' => $items,
        'subtotal' => $subtotal,
        'item_count' => count($items)
    ]);
}

/**
 * Add item to cart
 */
function addToCart($db) {
    // Get authenticated user
    $auth = new Auth();
    $user = $auth->getCurrentUser();
    
    // Debug logging
    error_log('Cart API - User result: ' . print_r($user, true));
    
    if (!$user) {
        error_log('Cart API - No user found, returning 401');
        Response::error('Unauthorized', 401);
    }
    
    $userId = $user['id'];
    error_log('Cart API - User ID: ' . $userId);
    
    // Get request data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['product_id'])) {
        Response::error('Product ID is required', 400);
    }
    
    $productId = $data['product_id'];
    $quantity = isset($data['quantity']) ? (int)$data['quantity'] : 1;
    
    // Get product details including seller_id
    $query = "SELECT id, price, seller_id, stock_quantity, status 
              FROM products 
              WHERE id = :product_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':product_id', $productId);
    $stmt->execute();
    $product = $stmt->fetch();
    
    if (!$product) {
        Response::error('Product not found', 404);
    }
    
    if ($product['status'] !== 'published') {
        Response::error('Product is not available', 400);
    }
    
    if ($product['stock_quantity'] < $quantity) {
        Response::error('Insufficient stock', 400);
    }
    
    $sellerId = $product['seller_id'];
    $price = $product['price'];
    
    // Get or create cart for user
    $cartId = getOrCreateCart($db, $userId);
    
    // Check if item already exists in cart
    $query = "SELECT id, quantity FROM cart_items 
              WHERE cart_id = :cart_id AND product_id = :product_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':cart_id', $cartId);
    $stmt->bindParam(':product_id', $productId);
    $stmt->execute();
    $existingItem = $stmt->fetch();
    
    if ($existingItem) {
        // Update quantity
        $newQuantity = $existingItem['quantity'] + $quantity;
        
        // Check stock
        if ($product['stock_quantity'] < $newQuantity) {
            Response::error('Insufficient stock', 400);
        }
        
        $query = "UPDATE cart_items 
                  SET quantity = :quantity 
                  WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':quantity', $newQuantity);
        $stmt->bindParam(':id', $existingItem['id']);
        $stmt->execute();
        
        Response::success([
            'message' => 'Cart item updated',
            'cart_item_id' => $existingItem['id']
        ]);
    } else {
        // Add new item
        $query = "INSERT INTO cart_items (cart_id, user_id, product_id, seller_id, quantity, price) 
                  VALUES (:cart_id, :user_id, :product_id, :seller_id, :quantity, :price)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':cart_id', $cartId);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':product_id', $productId);
        $stmt->bindParam(':seller_id', $sellerId);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':price', $price);
        $stmt->execute();
        
        Response::success([
            'message' => 'Item added to cart',
            'cart_item_id' => $db->lastInsertId()
        ]);
    }
}

/**
 * Clear user's cart
 */
function clearCart($db) {
    // Get authenticated user
    $auth = new Auth();
    $user = $auth->getCurrentUser();
    if (!$user) {
        Response::error('Unauthorized', 401);
    }
    
    $userId = $user['id'];
    
    // Get cart ID
    $query = "SELECT id FROM carts WHERE user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    $cart = $stmt->fetch();
    
    if (!$cart) {
        Response::success(['message' => 'Cart is already empty']);
    }
    
    // Delete all cart items
    $query = "DELETE FROM cart_items WHERE cart_id = :cart_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':cart_id', $cart['id']);
    $stmt->execute();
    
    Response::success(['message' => 'Cart cleared successfully']);
}

/**
 * Get or create cart for user
 */
function getOrCreateCart($db, $userId) {
    // Try to get existing cart
    $query = "SELECT id FROM carts WHERE user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    $cart = $stmt->fetch();
    
    if ($cart) {
        return $cart['id'];
    }
    
    // Create new cart
    $query = "INSERT INTO carts (user_id) VALUES (:user_id)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    return $db->lastInsertId();
}

