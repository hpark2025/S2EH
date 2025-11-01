<?php
/**
 * Upload User Avatar/Profile Picture Endpoint
 * POST /api/users/avatar
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

try {
    $database = new Database();
    $db = $database->getConnection();
    $userId = $user['id'];
    
    // Check if file was uploaded
    if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
        Response::error('No file uploaded or upload error', 400);
    }
    
    $file = $_FILES['avatar'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        Response::error('Invalid file type. Only JPG, PNG, and GIF are allowed.', 400);
    }
    
    // Validate file size (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        Response::error('File size must be less than 5MB', 400);
    }
    
    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/../../uploads/avatars/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = 'avatar_' . $userId . '_' . time() . '.' . $fileExtension;
    $filePath = $uploadDir . $fileName;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        Response::error('Failed to save file', 500);
    }
    
    // File path relative to backend root for database storage
    $avatarPath = '/S2EH/s2e-backend/uploads/avatars/' . $fileName;
    
    // Check if users table has avatar column, if not add it
    try {
        $checkColumn = $db->query("SHOW COLUMNS FROM users LIKE 'avatar'");
        if ($checkColumn->rowCount() === 0) {
            error_log('Avatar column does not exist, adding it to users table...');
            // Add avatar column
            $alterQuery = "ALTER TABLE users ADD COLUMN avatar VARCHAR(255) NULL AFTER phone";
            $db->exec($alterQuery);
            error_log('Avatar column added successfully');
        }
    } catch (Exception $e) {
        error_log('Avatar column check/creation error: ' . $e->getMessage());
    }
    
    // Get old avatar path to delete later
    $getOldAvatar = $db->prepare("SELECT avatar FROM users WHERE id = :user_id");
    $getOldAvatar->bindParam(':user_id', $userId);
    $getOldAvatar->execute();
    $oldAvatar = $getOldAvatar->fetch(PDO::FETCH_ASSOC);
    $oldAvatarPath = $oldAvatar['avatar'] ?? null;
    
    error_log('Updating avatar in database for user ID: ' . $userId);
    error_log('Avatar path: ' . $avatarPath);
    
    // Update user avatar in database
    $updateQuery = "UPDATE users SET avatar = :avatar, updated_at = CURRENT_TIMESTAMP WHERE id = :user_id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(':avatar', $avatarPath);
    $updateStmt->bindParam(':user_id', $userId);
    
    if ($updateStmt->execute()) {
        error_log('Avatar updated successfully in database for user ID: ' . $userId);
        
        // Verify the update by fetching the user
        $verifyQuery = "SELECT avatar FROM users WHERE id = :user_id";
        $verifyStmt = $db->prepare($verifyQuery);
        $verifyStmt->bindParam(':user_id', $userId);
        $verifyStmt->execute();
        $verified = $verifyStmt->fetch(PDO::FETCH_ASSOC);
        error_log('Verified avatar in database: ' . ($verified['avatar'] ?? 'NULL'));
        
        // Delete old avatar file if exists
        if ($oldAvatarPath) {
            $oldFullPath = __DIR__ . '/../../' . ltrim($oldAvatarPath, '/');
            if (file_exists($oldFullPath) && strpos($oldFullPath, 'uploads/avatars/') !== false) {
                @unlink($oldFullPath);
                error_log('Old avatar file deleted: ' . $oldFullPath);
            }
        }
        
        Response::success([
            'avatar' => $avatarPath
        ], 'Avatar uploaded successfully');
    } else {
        error_log('Failed to update avatar in database. Error info: ' . print_r($updateStmt->errorInfo(), true));
        // Delete uploaded file if database update failed
        @unlink($filePath);
        Response::error('Failed to update avatar in database', 500);
    }
    
} catch (Exception $e) {
    error_log('Upload Avatar Error: ' . $e->getMessage());
    Response::error('Failed to upload avatar: ' . $e->getMessage(), 500);
}

