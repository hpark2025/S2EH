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

// Get posted data (support both JSON and FormData)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
error_log('📝 Content-Type: ' . $contentType);
error_log('📝 POST data: ' . json_encode($_POST));
error_log('📝 FILES data: ' . json_encode($_FILES));

if (strpos($contentType, 'multipart/form-data') !== false) {
    error_log('✅ Using FormData mode');
    // Handle FormData (with file upload)
    $title = $_POST['title'] ?? null;
    $price = $_POST['price'] ?? null;
} else {
    error_log('✅ Using JSON mode');
    // Handle JSON
    $data = json_decode(file_get_contents("php://input"));
    $title = $data->title ?? null;
    $price = $data->price ?? null;
}

// Validate required fields
if (!$title || !$price) {
    Response::validationError([
        'title' => 'Product title is required',
        'price' => 'Price is required'
    ]);
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Generate slug from title
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
$slug = $slug . '-' . uniqid();

// Prepare data
if (strpos($contentType, 'multipart/form-data') !== false) {
    // Get data from $_POST
    $description = $_POST['description'] ?? null;
    $compareAtPrice = $_POST['compare_at_price'] ?? null;
    $categoryId = ($_POST['category_id'] ?? null) ?: null; // Convert empty string to null
    $sku = $_POST['sku'] ?? null;
    $stockQuantity = $_POST['stock_quantity'] ?? 0;
    $unit = $_POST['unit'] ?? 'kg';
    $status = $_POST['status'] ?? 'draft';
    $tags = $_POST['tags'] ?? '[]';
    
    // Handle image upload
    $thumbnail = null;
    if (isset($_FILES['image'])) {
        error_log('📸 Image file received');
        error_log('📸 File error code: ' . $_FILES['image']['error']);
        
        if ($_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../uploads/products/';
            error_log('📸 Upload directory: ' . $uploadDir);
            
            // Create directory if it doesn't exist
            if (!file_exists($uploadDir)) {
                error_log('📸 Creating upload directory...');
                mkdir($uploadDir, 0777, true);
            }
            
            $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $fileName = 'product_' . uniqid() . '.' . $fileExtension;
            $filePath = $uploadDir . $fileName;
            
            error_log('📸 Attempting to save to: ' . $filePath);
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
                $thumbnail = '/uploads/products/' . $fileName;
                error_log('✅ Image uploaded successfully: ' . $thumbnail);
            } else {
                error_log('❌ Failed to move uploaded file');
            }
        } else {
            error_log('❌ File upload error: ' . $_FILES['image']['error']);
        }
    } else {
        error_log('⚠️ No image file in request');
    }
    
    $images = json_encode([]);
} else {
    // Get data from JSON
    $description = $data->description ?? null;
    $compareAtPrice = $data->compare_at_price ?? null;
    $categoryId = ($data->category_id ?? null) ?: null; // Convert empty string to null
    $sku = $data->sku ?? null;
    $stockQuantity = $data->stock_quantity ?? 0;
    $unit = $data->unit ?? 'kg';
    $status = $data->status ?? 'draft';
    $thumbnail = $data->thumbnail ?? null;
    $images = json_encode($data->images ?? []);
    $tags = json_encode($data->tags ?? []);
}

// Insert product
error_log('💾 About to insert product with thumbnail: ' . ($thumbnail ?? 'NULL'));

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

