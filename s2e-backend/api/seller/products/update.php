<?php
/**
 * Update Product Endpoint (Seller only)
 * PUT /api/seller/products/{id}
 */

// CORS headers FIRST
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
if (in_array($origin, ['http://localhost:5173', 'http://localhost:5174'])) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../helpers/Response.php';
require_once __DIR__ . '/../../../helpers/Auth.php';

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

error_log("✅ Seller update endpoint - Seller ID: " . $user['id']);

// Get product ID from URL
$urlParts = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
$productId = end($urlParts);

if (!$productId || !is_numeric($productId)) {
    Response::error('Invalid product ID', 400);
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Verify product belongs to this seller
$checkQuery = "SELECT id FROM products WHERE id = :id AND seller_id = :seller_id";
$checkStmt = $db->prepare($checkQuery);
$checkStmt->bindParam(':id', $productId);
$checkStmt->bindParam(':seller_id', $user['id']);
$checkStmt->execute();

if ($checkStmt->rowCount() === 0) {
    Response::error('Product not found or you do not have permission to update it', 404);
}

// Build update query dynamically based on provided fields
$updateFields = [];
$params = [':id' => $productId];

if (isset($data->title)) {
    $updateFields[] = "title = :title";
    $params[':title'] = trim($data->title);
    
    // Update slug if title changes
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data->title)));
    $updateFields[] = "slug = :slug";
    $params[':slug'] = $slug . '-' . $productId;
}

if (isset($data->description)) {
    $updateFields[] = "description = :description";
    $params[':description'] = $data->description;
}

if (isset($data->price)) {
    $updateFields[] = "price = :price";
    $params[':price'] = $data->price;
}

if (isset($data->compare_at_price)) {
    $updateFields[] = "compare_at_price = :compare_at_price";
    $params[':compare_at_price'] = $data->compare_at_price;
}

if (isset($data->category_id)) {
    $updateFields[] = "category_id = :category_id";
    $params[':category_id'] = $data->category_id;
}

if (isset($data->sku)) {
    $updateFields[] = "sku = :sku";
    $params[':sku'] = $data->sku;
}

if (isset($data->stock_quantity)) {
    $updateFields[] = "stock_quantity = :stock_quantity";
    $params[':stock_quantity'] = $data->stock_quantity;
}

if (isset($data->unit)) {
    $updateFields[] = "unit = :unit";
    $params[':unit'] = $data->unit;
}

if (isset($data->status)) {
    $updateFields[] = "status = :status";
    $params[':status'] = $data->status;
}

if (isset($data->thumbnail)) {
    $updateFields[] = "thumbnail = :thumbnail";
    $params[':thumbnail'] = $data->thumbnail;
}

if (isset($data->images)) {
    $updateFields[] = "images = :images";
    $params[':images'] = json_encode($data->images);
}

if (isset($data->tags)) {
    $updateFields[] = "tags = :tags";
    $params[':tags'] = json_encode($data->tags);
}

// Always update updated_at
$updateFields[] = "updated_at = NOW()";

if (empty($updateFields)) {
    Response::error('No fields to update', 400);
}

// Execute update
$query = "UPDATE products SET " . implode(', ', $updateFields) . " WHERE id = :id";
$stmt = $db->prepare($query);

foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}

if ($stmt->execute()) {
    // Get updated product
    $getQuery = "SELECT * FROM products WHERE id = :id";
    $getStmt = $db->prepare($getQuery);
    $getStmt->bindParam(':id', $productId);
    $getStmt->execute();
    
    $product = $getStmt->fetch();
    $product['images'] = json_decode($product['images'] ?? '[]');
    $product['tags'] = json_decode($product['tags'] ?? '[]');
    
    Response::success($product, 'Product updated successfully');
} else {
    Response::serverError('Failed to update product');
}

