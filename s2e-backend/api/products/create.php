<?php
/**
 * Create Product Endpoint (Seller only)
 * POST /api/products/create
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

// Authenticate seller
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user || $user['user_type'] !== 'seller') {
    Response::unauthorized('Seller access required');
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (!isset($data->title) || !isset($data->price)) {
    Response::validationError([
        'title' => 'Product title is required',
        'price' => 'Price is required'
    ]);
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Generate slug from title
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data->title)));
$slug = $slug . '-' . uniqid();

// Prepare data
$title = trim($data->title);
$description = $data->description ?? null;
$price = $data->price;
$compareAtPrice = $data->compare_at_price ?? null;
$categoryId = $data->category_id ?? null;
$sku = $data->sku ?? null;
$stockQuantity = $data->stock_quantity ?? 0;
$unit = $data->unit ?? 'kg';
$status = $data->status ?? 'draft';
$thumbnail = $data->thumbnail ?? null;
$images = json_encode($data->images ?? []);
$tags = json_encode($data->tags ?? []);

// Insert product
$query = "INSERT INTO products 
          (seller_id, category_id, title, slug, description, price, compare_at_price, 
           sku, stock_quantity, unit, status, thumbnail, images, tags)
          VALUES 
          (:seller_id, :category_id, :title, :slug, :description, :price, :compare_at_price,
           :sku, :stock_quantity, :unit, :status, :thumbnail, :images, :tags)";

$stmt = $db->prepare($query);
$stmt->bindParam(':seller_id', $user['id']);
$stmt->bindParam(':category_id', $categoryId);
$stmt->bindParam(':title', $title);
$stmt->bindParam(':slug', $slug);
$stmt->bindParam(':description', $description);
$stmt->bindParam(':price', $price);
$stmt->bindParam(':compare_at_price', $compareAtPrice);
$stmt->bindParam(':sku', $sku);
$stmt->bindParam(':stock_quantity', $stockQuantity);
$stmt->bindParam(':unit', $unit);
$stmt->bindParam(':status', $status);
$stmt->bindParam(':thumbnail', $thumbnail);
$stmt->bindParam(':images', $images);
$stmt->bindParam(':tags', $tags);

if ($stmt->execute()) {
    $productId = $db->lastInsertId();
    
    // Get created product
    $getQuery = "SELECT * FROM products WHERE id = :id";
    $getStmt = $db->prepare($getQuery);
    $getStmt->bindParam(':id', $productId);
    $getStmt->execute();
    
    $product = $getStmt->fetch();
    $product['images'] = json_decode($product['images']);
    $product['tags'] = json_decode($product['tags']);
    
    Response::success($product, 'Product created successfully', 201);
} else {
    Response::serverError('Failed to create product');
}

