<?php
/**
 * Create Order Endpoint
 * POST /api/orders/create
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

// Authenticate user
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user || $user['user_type'] !== 'user') {
    Response::unauthorized('Customer access required');
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (!isset($data->items) || empty($data->items)) {
    Response::validationError(['items' => 'Order items are required']);
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Start transaction
$db->beginTransaction();

try {
    // Generate order number
    $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    
    // Calculate totals
    $subtotal = 0;
    $items = $data->items;
    
    // Verify products and calculate subtotal
    foreach ($items as $item) {
        $productQuery = "SELECT * FROM products WHERE id = :id AND stock_quantity >= :quantity";
        $productStmt = $db->prepare($productQuery);
        $productStmt->bindParam(':id', $item->product_id);
        $productStmt->bindParam(':quantity', $item->quantity);
        $productStmt->execute();
        
        $product = $productStmt->fetch();
        
        if (!$product) {
            throw new Exception("Product not available or insufficient stock");
        }
        
        $subtotal += $product['price'] * $item->quantity;
        $item->unit_price = $product['price'];
        $item->product_title = $product['title'];
        $item->product_sku = $product['sku'];
        $item->seller_id = $product['seller_id'];
    }
    
    // Get seller_id from first item (assuming single seller per order)
    $sellerId = $items[0]->seller_id;
    
    $shippingFee = $data->shipping_fee ?? 0;
    $tax = $data->tax ?? 0;
    $discount = $data->discount ?? 0;
    $total = $subtotal + $shippingFee + $tax - $discount;
    
    $paymentMethod = $data->payment_method ?? 'cod';
    $notes = $data->notes ?? null;
    $shippingAddressId = $data->shipping_address_id ?? null;
    $billingAddressId = $data->billing_address_id ?? $shippingAddressId; // Default to shipping address if not provided
    
    // Insert order - Set payment_status to 'cod' since all orders are COD
    $orderQuery = "INSERT INTO orders 
                   (order_number, user_id, seller_id, status, payment_status, payment_method,
                    subtotal, shipping_fee, tax, discount, total, notes, shipping_address_id, billing_address_id)
                   VALUES
                   (:order_number, :user_id, :seller_id, 'pending', 'cod', :payment_method,
                    :subtotal, :shipping_fee, :tax, :discount, :total, :notes, :shipping_address_id, :billing_address_id)";
    
    $orderStmt = $db->prepare($orderQuery);
    $orderStmt->bindParam(':order_number', $orderNumber);
    $orderStmt->bindParam(':user_id', $user['id']);
    $orderStmt->bindParam(':seller_id', $sellerId);
    $orderStmt->bindParam(':payment_method', $paymentMethod);
    $orderStmt->bindParam(':subtotal', $subtotal);
    $orderStmt->bindParam(':shipping_fee', $shippingFee);
    $orderStmt->bindParam(':tax', $tax);
    $orderStmt->bindParam(':discount', $discount);
    $orderStmt->bindParam(':total', $total);
    $orderStmt->bindParam(':notes', $notes);
    $orderStmt->bindParam(':shipping_address_id', $shippingAddressId);
    $orderStmt->bindParam(':billing_address_id', $billingAddressId);
    
    $orderStmt->execute();
    $orderId = $db->lastInsertId();
    
    // Insert order items and update stock
    foreach ($items as $item) {
        $itemSubtotal = $item->unit_price * $item->quantity;
        
        $itemQuery = "INSERT INTO order_items 
                      (order_id, product_id, product_title, product_sku, quantity, unit_price, subtotal)
                      VALUES
                      (:order_id, :product_id, :product_title, :product_sku, :quantity, :unit_price, :subtotal)";
        
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->bindParam(':order_id', $orderId);
        $itemStmt->bindParam(':product_id', $item->product_id);
        $itemStmt->bindParam(':product_title', $item->product_title);
        $itemStmt->bindParam(':product_sku', $item->product_sku);
        $itemStmt->bindParam(':quantity', $item->quantity);
        $itemStmt->bindParam(':unit_price', $item->unit_price);
        $itemStmt->bindParam(':subtotal', $itemSubtotal);
        $itemStmt->execute();
        
        // Update product stock
        $updateStockQuery = "UPDATE products SET stock_quantity = stock_quantity - :quantity WHERE id = :id";
        $updateStockStmt = $db->prepare($updateStockQuery);
        $updateStockStmt->bindParam(':quantity', $item->quantity);
        $updateStockStmt->bindParam(':id', $item->product_id);
        $updateStockStmt->execute();
    }
    
    // Commit transaction
    $db->commit();
    
    // Get created order
    $getOrderQuery = "SELECT * FROM orders WHERE id = :id";
    $getOrderStmt = $db->prepare($getOrderQuery);
    $getOrderStmt->bindParam(':id', $orderId);
    $getOrderStmt->execute();
    $order = $getOrderStmt->fetch();
    
    Response::success($order, 'Order created successfully', 201);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $db->rollBack();
    Response::error($e->getMessage(), 400);
}

