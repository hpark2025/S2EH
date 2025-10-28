<?php
// Simple product update endpoint
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';

// Get product ID from query string
$productId = $_GET['id'] ?? null;

if (!$productId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Product ID is required']);
    exit();
}

// Get PUT data
$data = json_decode(file_get_contents("php://input"));

$database = new Database();
$db = $database->getConnection();

// Build update query
$updateFields = [];
$params = [':id' => $productId];

if (isset($data->title)) {
    $updateFields[] = "title = :title";
    $params[':title'] = $data->title;
}
if (isset($data->description)) {
    $updateFields[] = "description = :description";
    $params[':description'] = $data->description;
}
if (isset($data->price)) {
    $updateFields[] = "price = :price";
    $params[':price'] = $data->price;
}
if (isset($data->stock_quantity)) {
    $updateFields[] = "stock_quantity = :stock_quantity";
    $params[':stock_quantity'] = $data->stock_quantity;
}
if (isset($data->status)) {
    $updateFields[] = "status = :status";
    $params[':status'] = $data->status;
}
if (isset($data->sku)) {
    $updateFields[] = "sku = :sku";
    $params[':sku'] = $data->sku;
}

$query = "UPDATE products SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = :id";
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
    
    echo json_encode([
        'success' => true,
        'message' => 'Product updated successfully',
        'data' => $product
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update product']);
}

