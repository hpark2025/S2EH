<?php
/**
 * Create Product Reviews Endpoint
 * POST /api/reviews/create.php
 * 
 * Accepts multiple reviews in one request for an order
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

if (!$user) {
    Response::unauthorized();
}

// Only users can review products
if ($user['user_type'] !== 'user') {
    Response::error('Only customers can submit reviews', 403);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $userId = $user['id'];
    
    $rawInput = file_get_contents('php://input');
    error_log("📥 Reviews API - Raw input: " . $rawInput);
    
    $data = json_decode($rawInput, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("❌ JSON decode error: " . json_last_error_msg());
        Response::error('Invalid JSON data: ' . json_last_error_msg(), 400);
    }
    
    error_log("📥 Reviews API - Decoded data: " . print_r($data, true));
    
    if (!isset($data['reviews']) || !is_array($data['reviews']) || empty($data['reviews'])) {
        error_log("❌ Missing or empty reviews array");
        Response::error('Reviews array is required', 400);
    }
    
    error_log("✅ Reviews API - Processing " . count($data['reviews']) . " review(s) for user ID: $userId");
    
    // Check if reviews table exists, create if not
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS `reviews` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `user_id` int(11) NOT NULL,
            `product_id` int(11) NOT NULL,
            `order_id` int(11) NOT NULL,
            `rating` tinyint(1) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
            `title` varchar(255) NOT NULL,
            `review` text NOT NULL,
            `is_verified` tinyint(1) DEFAULT 0,
            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
            `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (`id`),
            KEY `user_id` (`user_id`),
            KEY `product_id` (`product_id`),
            KEY `order_id` (`order_id`),
            UNIQUE KEY `user_product_order` (`user_id`, `product_id`, `order_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    } catch (Exception $e) {
        error_log('Error creating reviews table: ' . $e->getMessage());
    }
    
    $insertedReviews = [];
    $errors = [];
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        foreach ($data['reviews'] as $index => $reviewData) {
            error_log("📝 Processing review #$index: " . print_r($reviewData, true));
            
            // Validate review data
            $missingFields = [];
            if (!isset($reviewData['product_id'])) $missingFields[] = 'product_id';
            if (!isset($reviewData['order_id'])) $missingFields[] = 'order_id';
            if (!isset($reviewData['rating'])) $missingFields[] = 'rating';
            if (!isset($reviewData['title'])) $missingFields[] = 'title';
            if (!isset($reviewData['review'])) $missingFields[] = 'review';
            
            if (!empty($missingFields)) {
                $errorMsg = 'Missing required fields for review: ' . implode(', ', $missingFields);
                error_log("❌ $errorMsg");
                $errors[] = $errorMsg;
                continue;
            }
            
            $productId = intval($reviewData['product_id']);
            $orderId = intval($reviewData['order_id']);
            $rating = intval($reviewData['rating']);
            $title = trim($reviewData['title']);
            $review = trim($reviewData['review']);
            
            // Validate rating
            if ($rating < 1 || $rating > 5) {
                $errors[] = "Invalid rating for product ID $productId. Rating must be between 1 and 5.";
                continue;
            }
            
            // Validate title
            if (empty($title) || strlen($title) > 255) {
                $errors[] = "Invalid title for product ID $productId. Title is required and must be 255 characters or less.";
                continue;
            }
            
            // Validate review content
            if (empty($review) || strlen($review) < 10) {
                $errors[] = "Invalid review for product ID $productId. Review must be at least 10 characters.";
                continue;
            }
            
            // Verify order belongs to user
            $orderCheck = $db->prepare("SELECT id, user_id, status FROM orders WHERE id = :order_id");
            $orderCheck->bindParam(':order_id', $orderId, PDO::PARAM_INT);
            $orderCheck->execute();
            $order = $orderCheck->fetch(PDO::FETCH_ASSOC);
            
            if (!$order) {
                $errors[] = "Order ID $orderId not found";
                continue;
            }
            
            if ($order['user_id'] != $userId) {
                $errors[] = "Order ID $orderId does not belong to you";
                continue;
            }
            
            if ($order['status'] !== 'delivered') {
                $errors[] = "Order ID $orderId is not delivered. Only delivered orders can be reviewed.";
                continue;
            }
            
            // Verify product exists in order
            $orderItemCheck = $db->prepare("SELECT id FROM order_items WHERE order_id = :order_id AND product_id = :product_id");
            $orderItemCheck->bindParam(':order_id', $orderId, PDO::PARAM_INT);
            $orderItemCheck->bindParam(':product_id', $productId, PDO::PARAM_INT);
            $orderItemCheck->execute();
            
            if ($orderItemCheck->rowCount() === 0) {
                $errors[] = "Product ID $productId is not in order ID $orderId";
                continue;
            }
            
            // Check if review already exists (using unique constraint)
            $existingCheck = $db->prepare("SELECT id FROM reviews WHERE user_id = :user_id AND product_id = :product_id AND order_id = :order_id");
            $existingCheck->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $existingCheck->bindParam(':product_id', $productId, PDO::PARAM_INT);
            $existingCheck->bindParam(':order_id', $orderId, PDO::PARAM_INT);
            $existingCheck->execute();
            
            if ($existingCheck->rowCount() > 0) {
                // Update existing review
                $existingReview = $existingCheck->fetch(PDO::FETCH_ASSOC);
                $reviewId = $existingReview['id'];
                
                $updateQuery = "UPDATE reviews SET rating = :rating, title = :title, review = :review, updated_at = NOW() 
                               WHERE id = :review_id";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->bindParam(':rating', $rating, PDO::PARAM_INT);
                $updateStmt->bindParam(':title', $title);
                $updateStmt->bindParam(':review', $review);
                $updateStmt->bindParam(':review_id', $reviewId, PDO::PARAM_INT);
                
                if (!$updateStmt->execute()) {
                    $errors[] = "Failed to update review for product ID $productId";
                    error_log("Update review error: " . print_r($updateStmt->errorInfo(), true));
                    continue;
                }
                
                $insertedReviews[] = [
                    'id' => $reviewId,
                    'product_id' => $productId,
                    'order_id' => $orderId,
                    'rating' => $rating,
                    'title' => $title,
                    'review' => $review,
                    'updated' => true
                ];
                error_log("✅ Review updated successfully - ID: $reviewId for product $productId, order $orderId");
            } else {
                error_log("📝 No existing review found, creating new review for product $productId, order $orderId");
                // Insert new review
                $insertQuery = "INSERT INTO reviews (user_id, product_id, order_id, rating, title, review, is_verified, created_at)
                               VALUES (:user_id, :product_id, :order_id, :rating, :title, :review, 1, NOW())";
                $insertStmt = $db->prepare($insertQuery);
                $insertStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $insertStmt->bindParam(':product_id', $productId, PDO::PARAM_INT);
                $insertStmt->bindParam(':order_id', $orderId, PDO::PARAM_INT);
                $insertStmt->bindParam(':rating', $rating, PDO::PARAM_INT);
                $insertStmt->bindParam(':title', $title);
                $insertStmt->bindParam(':review', $review);
                
                if (!$insertStmt->execute()) {
                    $errors[] = "Failed to insert review for product ID $productId";
                    error_log("Insert review error: " . print_r($insertStmt->errorInfo(), true));
                    continue;
                }
                
                $reviewId = $db->lastInsertId();
                error_log("✅ Review inserted successfully - ID: $reviewId for product $productId, order $orderId");
                $insertedReviews[] = [
                    'id' => $reviewId,
                    'product_id' => $productId,
                    'order_id' => $orderId,
                    'rating' => $rating,
                    'title' => $title,
                    'review' => $review,
                    'updated' => false
                ];
            }
        }
        
        if (!empty($errors)) {
            $db->rollBack();
            error_log("❌ Transaction rolled back due to errors: " . implode('; ', $errors));
            Response::error('Some reviews failed validation: ' . implode('; ', $errors), 400);
        }
        
        if (empty($insertedReviews)) {
            $db->rollBack();
            error_log("❌ No reviews were inserted or updated");
            Response::error('No reviews were processed successfully', 400);
        }
        
        // Commit transaction
        $db->commit();
        error_log("✅ Transaction committed successfully. " . count($insertedReviews) . " review(s) saved.");
        
        Response::success([
            'reviews' => $insertedReviews,
            'count' => count($insertedReviews)
        ], 'Reviews submitted successfully', 201);
        
    } catch (Exception $e) {
        $db->rollBack();
        error_log("Error creating reviews: " . $e->getMessage());
        Response::error('Failed to submit reviews: ' . $e->getMessage(), 500);
    }
    
} catch (Exception $e) {
    error_log('Create Reviews Error: ' . $e->getMessage());
    Response::error('Failed to submit reviews: ' . $e->getMessage(), 500);
}

