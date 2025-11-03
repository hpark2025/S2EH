<?php
/**
 * Messages API Endpoint
 * GET /api/messages - Get user messages/conversations
 * POST /api/messages - Send a new message
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Connect to database first (needed for debug)
$database = new Database();
$db = $database->getConnection();

// Authenticate user
$auth = new Auth();

// Debug: Log authorization header using multiple methods
$headers = [];
if (function_exists('getallheaders')) {
    $headers = getallheaders();
} elseif (function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
}

$headersLower = array_change_key_case($headers ?: [], CASE_LOWER);
$authHeader = $headersLower['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;

error_log('🔍 Messages API - REQUEST_METHOD: ' . $_SERVER['REQUEST_METHOD']);
error_log('🔍 Messages API - Authorization header (getallheaders): ' . ($headersLower['authorization'] ?? 'NOT FOUND'));
error_log('🔍 Messages API - HTTP_AUTHORIZATION: ' . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT FOUND'));
error_log('🔍 Messages API - REDIRECT_HTTP_AUTHORIZATION: ' . ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT FOUND'));
error_log('🔍 Messages API - Final authHeader: ' . ($authHeader ? substr($authHeader, 0, 30) . '...' : 'NOT FOUND'));
error_log('🔍 Messages API - All headers: ' . json_encode($headers));

$user = $auth->getCurrentUser();

if (!$user) {
    error_log('❌ Messages API - Unauthorized: User not found');
    error_log('❌ Messages API - Token verification failed or token expired');
    
    // Additional debug: Try to extract token manually and check database
    $debugToken = null;
    if ($authHeader) {
        $debugToken = preg_replace('/^Bearer\s+/i', '', trim($authHeader));
        if ($debugToken) {
            error_log('🔍 Messages API - Extracted token for debug: ' . substr($debugToken, 0, 20) . '...');
            
            // Check if token exists in database at all
            try {
                $debugStmt = $db->prepare('SELECT * FROM sessions WHERE token = :token LIMIT 1');
                $debugStmt->bindParam(':token', $debugToken);
                $debugStmt->execute();
                $debugSession = $debugStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($debugSession) {
                    error_log('🔍 Messages API - Token EXISTS in database');
                    error_log('🔍 Messages API - Session expires_at: ' . ($debugSession['expires_at'] ?? 'N/A'));
                    error_log('🔍 Messages API - Current time: ' . date('Y-m-d H:i:s'));
                    
                    $expiresAt = new DateTime($debugSession['expires_at']);
                    $now = new DateTime();
                    if ($expiresAt <= $now) {
                        error_log('⚠️ Messages API - Token is EXPIRED');
                    } else {
                        error_log('⚠️ Messages API - Token is NOT expired but still failing verification');
                    }
                } else {
                    error_log('⚠️ Messages API - Token NOT FOUND in sessions table');
                }
            } catch (Exception $e) {
                error_log('❌ Messages API - Error checking token: ' . $e->getMessage());
            }
        }
    }
    
    Response::unauthorized();
}

error_log('✅ Messages API - Authenticated user: ' . ($user['id'] ?? 'N/A') . ' (' . ($user['user_type'] ?? 'N/A') . ')');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get conversations list
    // Optionally filter by seller_id if provided as query param
    $sellerId = $_GET['seller_id'] ?? null;
    
    if ($user['user_type'] === 'user') {
        // Customer: Get all conversations with sellers
        if ($sellerId) {
            // Get specific conversation with a seller
            $sellerIdInt = (int)$sellerId; // Ensure it's an integer
            $userIdInt = (int)$user['id']; // Ensure it's an integer
            
            $query = "SELECT m.*, 
                            s.business_name as seller_name,
                            s.owner_name as seller_owner_name,
                            u.first_name as customer_first_name,
                            u.last_name as customer_last_name
                     FROM messages m
                     LEFT JOIN sellers s ON (m.receiver_id = s.id AND m.receiver_type = 'seller')
                     LEFT JOIN users u ON (m.sender_id = u.id AND m.sender_type = 'user')
                     WHERE ((m.sender_id = :user_id1 AND m.sender_type = 'user' AND m.receiver_id = :seller_id1 AND m.receiver_type = 'seller')
                            OR (m.receiver_id = :user_id2 AND m.receiver_type = 'user' AND m.sender_id = :seller_id2 AND m.sender_type = 'seller'))
                     ORDER BY m.created_at ASC";
            
            $stmt = $db->prepare($query);
            $stmt->bindValue(':user_id1', $userIdInt, PDO::PARAM_INT);
            $stmt->bindValue(':seller_id1', $sellerIdInt, PDO::PARAM_INT);
            $stmt->bindValue(':user_id2', $userIdInt, PDO::PARAM_INT);
            $stmt->bindValue(':seller_id2', $sellerIdInt, PDO::PARAM_INT);
            $stmt->execute();
            
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success([
                'messages' => $messages,
                'seller_id' => $sellerId
            ], 'Messages fetched successfully');
        } else {
            // Get list of all conversations (grouped by seller)
            // Use unique parameter names for each occurrence of user_id
            $query = "SELECT 
                            CASE 
                                WHEN m.sender_id = :user_id1 AND m.sender_type = 'user' THEN m.receiver_id
                                ELSE m.sender_id
                            END as seller_id,
                            s.business_name as seller_name,
                            s.owner_name as seller_owner_name,
                            MAX(m.created_at) as last_message_time,
                            (SELECT message FROM messages m2 
                             WHERE ((m2.sender_id = :user_id2 AND m2.sender_type = 'user' AND m2.receiver_id = CASE 
                                        WHEN m.sender_id = :user_id3 AND m.sender_type = 'user' THEN m.receiver_id
                                        ELSE m.sender_id
                                    END AND m2.receiver_type = 'seller')
                                OR (m2.receiver_id = :user_id4 AND m2.receiver_type = 'user' AND m2.sender_id = CASE 
                                        WHEN m.sender_id = :user_id5 AND m.sender_type = 'user' THEN m.receiver_id
                                        ELSE m.sender_id
                                    END AND m2.sender_type = 'seller'))
                             ORDER BY m2.created_at DESC LIMIT 1) as last_message,
                            (SELECT COUNT(*) FROM messages m3 
                             WHERE m3.receiver_id = :user_id6 AND m3.receiver_type = 'user' 
                             AND m3.sender_id = CASE 
                                        WHEN m.sender_id = :user_id7 AND m.sender_type = 'user' THEN m.receiver_id
                                        ELSE m.sender_id
                                    END AND m3.sender_type = 'seller'
                             AND m3.is_read = 0) as unread_count
                     FROM messages m
                     LEFT JOIN sellers s ON (CASE 
                                                WHEN m.sender_id = :user_id8 AND m.sender_type = 'user' THEN m.receiver_id
                                                ELSE m.sender_id
                                            END = s.id)
                     WHERE (m.sender_id = :user_id9 AND m.sender_type = 'user' AND m.receiver_type = 'seller')
                        OR (m.receiver_id = :user_id10 AND m.receiver_type = 'user' AND m.sender_type = 'seller')
                     GROUP BY 
                        CASE 
                            WHEN m.sender_id = :user_id11 AND m.sender_type = 'user' THEN m.receiver_id
                            ELSE m.sender_id
                        END,
                        s.business_name, 
                        s.owner_name
                     ORDER BY last_message_time DESC";
            
            $stmt = $db->prepare($query);
            $userId = $user['id'];
            // Bind all unique parameters with the same value
            $stmt->bindValue(':user_id1', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id2', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id3', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id4', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id5', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id6', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id7', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id8', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id9', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id10', $userId, PDO::PARAM_INT);
            $stmt->bindValue(':user_id11', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success([
                'conversations' => $conversations
            ], 'Conversations fetched successfully');
        }
    } elseif ($user['user_type'] === 'seller') {
        // Seller: Get all conversations with customers
        $customerId = $_GET['customer_id'] ?? null;
        
        if ($customerId) {
            // Get specific conversation with a customer
            // Use unique parameter names for each occurrence
            $query = "SELECT m.*, 
                            s.business_name as seller_name,
                            u.first_name as customer_first_name,
                            u.last_name as customer_last_name
                     FROM messages m
                     LEFT JOIN sellers s ON (m.sender_id = s.id AND m.sender_type = 'seller')
                     LEFT JOIN users u ON (m.receiver_id = u.id AND m.receiver_type = 'user')
                     WHERE ((m.sender_id = :seller_id1 AND m.sender_type = 'seller' AND m.receiver_id = :customer_id1 AND m.receiver_type = 'user')
                            OR (m.receiver_id = :seller_id2 AND m.receiver_type = 'seller' AND m.sender_id = :customer_id2 AND m.sender_type = 'user'))
                     ORDER BY m.created_at ASC";
            
            $stmt = $db->prepare($query);
            $sellerId = $user['id'];
            $customerIdInt = (int)$customerId;
            $stmt->bindValue(':seller_id1', $sellerId, PDO::PARAM_INT);
            $stmt->bindValue(':customer_id1', $customerIdInt, PDO::PARAM_INT);
            $stmt->bindValue(':seller_id2', $sellerId, PDO::PARAM_INT);
            $stmt->bindValue(':customer_id2', $customerIdInt, PDO::PARAM_INT);
            $stmt->execute();
            
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success([
                'messages' => $messages,
                'customer_id' => $customerId
            ], 'Messages fetched successfully');
        } else {
            // Get list of all conversations (grouped by customer)
            // Use unique parameter names for each occurrence of seller_id
            $query = "SELECT DISTINCT
                            CASE 
                                WHEN m.sender_id = :seller_id1 AND m.sender_type = 'seller' THEN m.receiver_id
                                ELSE m.sender_id
                            END as customer_id,
                            u.first_name as customer_first_name,
                            u.last_name as customer_last_name,
                            (SELECT message FROM messages m2 
                             WHERE (m2.sender_id = :seller_id2 AND m2.sender_type = 'seller' AND m2.receiver_id = customer_id AND m2.receiver_type = 'user')
                                OR (m2.receiver_id = :seller_id3 AND m2.receiver_type = 'seller' AND m2.sender_id = customer_id AND m2.sender_type = 'user')
                             ORDER BY m2.created_at DESC LIMIT 1) as last_message,
                            (SELECT created_at FROM messages m2 
                             WHERE (m2.sender_id = :seller_id4 AND m2.sender_type = 'seller' AND m2.receiver_id = customer_id AND m2.receiver_type = 'user')
                                OR (m2.receiver_id = :seller_id5 AND m2.receiver_type = 'seller' AND m2.sender_id = customer_id AND m2.sender_type = 'user')
                             ORDER BY m2.created_at DESC LIMIT 1) as last_message_time,
                            (SELECT COUNT(*) FROM messages m2 
                             WHERE m2.receiver_id = :seller_id6 AND m2.receiver_type = 'seller' 
                             AND m2.sender_id = customer_id AND m2.sender_type = 'user'
                             AND m2.is_read = 0) as unread_count
                     FROM messages m
                     LEFT JOIN users u ON (CASE 
                                                WHEN m.sender_id = :seller_id7 AND m.sender_type = 'seller' THEN m.receiver_id
                                                ELSE m.sender_id
                                            END = u.id)
                     WHERE (m.sender_id = :seller_id8 AND m.sender_type = 'seller' AND m.receiver_type = 'user')
                        OR (m.receiver_id = :seller_id9 AND m.receiver_type = 'seller' AND m.sender_type = 'user')
                     GROUP BY customer_id, u.first_name, u.last_name
                     ORDER BY last_message_time DESC";
            
            $stmt = $db->prepare($query);
            $sellerId = $user['id'];
            // Bind all unique parameters with the same value
            $stmt->bindValue(':seller_id1', $sellerId, PDO::PARAM_INT);
            $stmt->bindValue(':seller_id2', $sellerId, PDO::PARAM_INT);
            $stmt->bindValue(':seller_id3', $sellerId, PDO::PARAM_INT);
            $stmt->bindValue(':seller_id4', $sellerId, PDO::PARAM_INT);
            $stmt->bindValue(':seller_id5', $sellerId, PDO::PARAM_INT);
            $stmt->bindValue(':seller_id6', $sellerId, PDO::PARAM_INT);
            $stmt->bindValue(':seller_id7', $sellerId, PDO::PARAM_INT);
            $stmt->bindValue(':seller_id8', $sellerId, PDO::PARAM_INT);
            $stmt->bindValue(':seller_id9', $sellerId, PDO::PARAM_INT);
            $stmt->execute();
            
            $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success([
                'conversations' => $conversations
            ], 'Conversations fetched successfully');
        }
    } else {
        Response::error('Invalid user type for messages', 403);
    }
    
} elseif ($method === 'POST') {
    // Send a new message (supports both JSON and multipart/form-data for image uploads)
    
    // Check if this is multipart/form-data
    // When using FormData with files, $_FILES will be populated
    $isMultipart = !empty($_FILES);
    
    // Also check Content-Type header as fallback
    if (!$isMultipart) {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        $isMultipart = strpos($contentType, 'multipart/form-data') !== false;
    }
    
    if ($isMultipart) {
        // Handle multipart/form-data (for image uploads)
        $receiverId = $_POST['receiver_id'] ?? null;
        $receiverType = $_POST['receiver_type'] ?? null;
        $messageText = $_POST['message'] ?? '';
        $subject = $_POST['subject'] ?? null;
        $parentMessageId = $_POST['parent_message_id'] ?? null;
        
        error_log("📤 Multipart request - receiver_id: $receiverId, receiver_type: $receiverType, message length: " . strlen($messageText));
        error_log("📤 Files present: " . (isset($_FILES['image']) ? 'yes' : 'no'));
        if (isset($_FILES['image'])) {
            error_log("📤 Image file error code: " . $_FILES['image']['error']);
        }
    } else {
        // Handle JSON
        $data = json_decode(file_get_contents('php://input'), true);
        $receiverId = $data['receiver_id'] ?? null;
        $receiverType = $data['receiver_type'] ?? null;
        $messageText = $data['message'] ?? '';
        $subject = $data['subject'] ?? null;
        $parentMessageId = $data['parent_message_id'] ?? null;
        
        error_log("📤 JSON request - receiver_id: $receiverId, receiver_type: $receiverType, message: " . substr($messageText, 0, 50));
    }
    
    // Check if image is being uploaded
    // Check if file exists and upload was successful (not "no file" error)
    $hasImage = false;
    if ($isMultipart && isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
        // File was provided, check if upload was successful
        $hasImage = $_FILES['image']['error'] === UPLOAD_ERR_OK;
    }
    
    // Validate: receiver_id and receiver_type are always required
    // message is required UNLESS there's an image attachment
    if (!$receiverId || !$receiverType || (!$messageText && !$hasImage)) {
        Response::error('receiver_id, receiver_type, and message (or image attachment) are required', 400);
    }
    
    // Validate receiver_type
    if (!in_array($receiverType, ['user', 'seller', 'admin'])) {
        Response::error('Invalid receiver_type', 400);
    }
    
    // Determine sender type
    $senderType = $user['user_type'];
    $senderId = $user['id'];
    
    // Validate that user is sending to appropriate receiver
    if ($senderType === 'user' && $receiverType !== 'seller') {
        Response::error('Users can only message sellers', 403);
    }
    if ($senderType === 'seller' && $receiverType !== 'user') {
        Response::error('Sellers can only message users', 403);
    }
    
    // Handle image upload if present
    $attachmentUrl = null;
    if ($isMultipart && isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['image'];
        
        // Validate file type (only images)
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            Response::error('Invalid file type. Only images (JPG, PNG, GIF, WEBP) are allowed.', 400);
        }
        
        // Validate file size (max 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            Response::error('Image size must be less than 5MB', 400);
        }
        
        // Create uploads directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../uploads/messages/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Generate unique filename
        $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = 'message_' . $senderId . '_' . time() . '_' . uniqid() . '.' . $fileExtension;
        $filePath = $uploadDir . $fileName;
        
        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            // Path relative to backend root for database storage
            $attachmentUrl = '/uploads/messages/' . $fileName;
        } else {
            Response::error('Failed to upload image', 500);
        }
    }
    
    // Check if attachment_url column exists, if not add it
    try {
        $checkColumn = $db->query("SHOW COLUMNS FROM messages LIKE 'attachment_url'");
        if ($checkColumn->rowCount() === 0) {
            error_log('attachment_url column does not exist, adding it to messages table...');
            $db->exec("ALTER TABLE messages ADD COLUMN attachment_url VARCHAR(255) NULL AFTER message");
            error_log('attachment_url column added successfully');
        }
    } catch (Exception $e) {
        error_log('attachment_url column check/creation error: ' . $e->getMessage());
    }
    
    try {
        // Build query with optional attachment_url
        if ($attachmentUrl) {
            $query = "INSERT INTO messages (sender_id, sender_type, receiver_id, receiver_type, subject, message, attachment_url, parent_message_id, is_read, created_at)
                      VALUES (:sender_id, :sender_type, :receiver_id, :receiver_type, :subject, :message, :attachment_url, :parent_message_id, 0, NOW())";
        } else {
            $query = "INSERT INTO messages (sender_id, sender_type, receiver_id, receiver_type, subject, message, parent_message_id, is_read, created_at)
                      VALUES (:sender_id, :sender_type, :receiver_id, :receiver_type, :subject, :message, :parent_message_id, 0, NOW())";
        }
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':sender_id', $senderId, PDO::PARAM_INT);
        $stmt->bindParam(':sender_type', $senderType);
        $stmt->bindParam(':receiver_id', $receiverId, PDO::PARAM_INT);
        $stmt->bindParam(':receiver_type', $receiverType);
        $stmt->bindParam(':subject', $subject);
        $stmt->bindParam(':message', $messageText);
        if ($attachmentUrl) {
            $stmt->bindParam(':attachment_url', $attachmentUrl);
        }
        $stmt->bindParam(':parent_message_id', $parentMessageId, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            $messageId = $db->lastInsertId();
            
            // Fetch the created message with sender/receiver details
            $fetchQuery = "SELECT m.*, 
                                  s.business_name as seller_name,
                                  u.first_name as customer_first_name,
                                  u.last_name as customer_last_name
                           FROM messages m
                           LEFT JOIN sellers s ON (m.sender_id = s.id AND m.sender_type = 'seller')
                           LEFT JOIN users u ON (m.sender_id = u.id AND m.sender_type = 'user')
                           WHERE m.id = :message_id";
            
            $fetchStmt = $db->prepare($fetchQuery);
            $fetchStmt->bindParam(':message_id', $messageId, PDO::PARAM_INT);
            $fetchStmt->execute();
            $createdMessage = $fetchStmt->fetch(PDO::FETCH_ASSOC);
            
            Response::success([
                'message' => $createdMessage
            ], 'Message sent successfully', 201);
        } else {
            Response::error('Failed to send message', 500);
        }
    } catch (Exception $e) {
        error_log("Error sending message: " . $e->getMessage());
        Response::error('Failed to send message', 500);
    }
} elseif ($method === 'PUT' || $method === 'PATCH') {
    // Mark messages as read
    $data = json_decode(file_get_contents('php://input'), true);
    
    $sellerId = $data['seller_id'] ?? null;
    $customerId = $data['customer_id'] ?? null;
    
    if ($user['user_type'] === 'user' && $sellerId) {
        // Customer marking messages from a seller as read
        $sellerIdInt = (int)$sellerId;
        $userIdInt = (int)$user['id'];
        
        try {
            $updateQuery = "UPDATE messages 
                           SET is_read = 1, read_at = NOW()
                           WHERE receiver_id = :user_id 
                           AND receiver_type = 'user' 
                           AND sender_id = :seller_id 
                           AND sender_type = 'seller' 
                           AND is_read = 0";
            
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(':user_id', $userIdInt, PDO::PARAM_INT);
            $updateStmt->bindParam(':seller_id', $sellerIdInt, PDO::PARAM_INT);
            $updateStmt->execute();
            
            $rowsAffected = $updateStmt->rowCount();
            
            Response::success([
                'messages_marked' => $rowsAffected
            ], 'Messages marked as read successfully');
        } catch (Exception $e) {
            error_log("Error marking messages as read: " . $e->getMessage());
            Response::error('Failed to mark messages as read', 500);
        }
    } elseif ($user['user_type'] === 'seller' && $customerId) {
        // Seller marking messages from a customer as read
        $customerIdInt = (int)$customerId;
        $sellerIdInt = (int)$user['id'];
        
        try {
            $updateQuery = "UPDATE messages 
                           SET is_read = 1, read_at = NOW()
                           WHERE receiver_id = :seller_id 
                           AND receiver_type = 'seller' 
                           AND sender_id = :customer_id 
                           AND sender_type = 'user' 
                           AND is_read = 0";
            
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(':seller_id', $sellerIdInt, PDO::PARAM_INT);
            $updateStmt->bindParam(':customer_id', $customerIdInt, PDO::PARAM_INT);
            $updateStmt->execute();
            
            $rowsAffected = $updateStmt->rowCount();
            
            Response::success([
                'messages_marked' => $rowsAffected
            ], 'Messages marked as read successfully');
        } catch (Exception $e) {
            error_log("Error marking messages as read: " . $e->getMessage());
            Response::error('Failed to mark messages as read', 500);
        }
    } else {
        Response::error('seller_id (for users) or customer_id (for sellers) is required', 400);
    }
} else {
    Response::error('Method not allowed', 405);
}

