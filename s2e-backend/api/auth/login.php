<?php
/**
 * Login Endpoint
 * Handles user, seller, and admin login
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate input
if (!isset($data->email) || !isset($data->password) || !isset($data->user_type)) {
    Response::validationError([
        'email' => 'Email is required',
        'password' => 'Password is required',
        'user_type' => 'User type is required'
    ]);
}

$email = trim($data->email);
$password = $data->password;
$userType = $data->user_type; // 'user', 'seller', or 'admin'

// Validate user type
if (!in_array($userType, ['user', 'seller', 'admin'])) {
    Response::validationError(['user_type' => 'Invalid user type']);
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Determine table based on user type
$table = $userType . 's'; // users, sellers, or admins

// For user login, check if email exists in sellers table first
if ($userType === 'user') {
    $checkSellerQuery = "SELECT id FROM sellers WHERE email = :email LIMIT 1";
    $checkSellerStmt = $db->prepare($checkSellerQuery);
    $checkSellerStmt->bindParam(':email', $email);
    $checkSellerStmt->execute();
    
    if ($checkSellerStmt->fetch()) {
        Response::error('This email is registered as a seller. Please use the seller login page.', 403);
    }
}

// Query user
$query = "SELECT * FROM {$table} WHERE email = :email LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bindParam(':email', $email);
$stmt->execute();

$user = $stmt->fetch();

// Debug logging
error_log("🔍 Login attempt - User Type: {$userType}, Email: {$email}, Table: {$table}");
error_log("🔍 User found: " . ($user ? 'YES (ID: ' . $user['id'] . ')' : 'NO'));

// Verify user exists
if (!$user) {
    error_log("❌ User not found in {$table} table for email: {$email}");
    Response::error('Invalid email or password', 401);
}

// Verify password
$passwordValid = Auth::verifyPassword($password, $user['password']);
error_log("🔍 Password verification: " . ($passwordValid ? 'VALID' : 'INVALID'));
error_log("🔍 Password hash in DB: " . substr($user['password'], 0, 20) . '...');

if (!$passwordValid) {
    error_log("❌ Password verification failed for user ID: {$user['id']}");
    Response::error('Invalid email or password', 401);
}

// Check status for all user types
if (isset($user['status'])) {
    if ($user['status'] === 'pending') {
        if ($userType === 'user') {
            Response::error('Your account is pending admin approval. Please wait for verification before logging in.', 403);
        }
    } elseif ($user['status'] !== 'active') {
        $statusMessage = 'Account is not active';
        if ($user['status'] === 'inactive') {
            $statusMessage = 'Your account has been deactivated. Please contact support.';
        } elseif ($user['status'] === 'suspended') {
            $statusMessage = 'Your account has been suspended. Please contact support.';
        }
        Response::error($statusMessage, 403);
    }
}

// Additional check for sellers - must be verified by admin
if ($userType === 'seller') {
    if (isset($user['verification_status']) && $user['verification_status'] !== 'verified') {
        $statusMessage = 'Your seller account is pending verification. Please wait for admin approval.';
        if ($user['verification_status'] === 'rejected') {
            $statusMessage = 'Your seller application has been rejected. Please contact support.';
        }
        Response::error($statusMessage, 403);
    }
}

// Create session
$auth = new Auth();
$session = $auth->createSession($user['id'], $userType);

if (!$session) {
    Response::serverError('Failed to create session');
}

// Update last login
$updateQuery = "UPDATE {$table} SET last_login = NOW() WHERE id = :id";
$updateStmt = $db->prepare($updateQuery);
$updateStmt->bindParam(':id', $user['id']);
$updateStmt->execute();

// Remove password from response
unset($user['password']);

// Return success response
Response::success([
    'user' => $user,
    'token' => $session['token'],
    'expires_at' => $session['expires_at'],
    'user_type' => $userType
], 'Login successful');

