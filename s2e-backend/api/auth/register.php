<?php
/**
 * Registration Endpoint
 * Handles user and seller registration
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

// Validate user type
$userType = $data->user_type ?? 'user';
if (!in_array($userType, ['user', 'seller'])) {
    Response::validationError(['user_type' => 'Invalid user type']);
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

if ($userType === 'user') {
    // User registration
    if (!isset($data->email) || !isset($data->password) || !isset($data->first_name) || !isset($data->last_name)) {
        Response::validationError([
            'email' => 'Email is required',
            'password' => 'Password is required',
            'first_name' => 'First name is required',
            'last_name' => 'Last name is required'
        ]);
    }
    
    $email = trim($data->email);
    $password = Auth::hashPassword($data->password);
    $firstName = trim($data->first_name);
    $lastName = trim($data->last_name);
    $phone = $data->phone ?? null;
    
    // Check if email exists
    $checkQuery = "SELECT id FROM users WHERE email = :email";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        Response::error('Email already exists', 409);
    }
    
    // Insert user with pending status (requires admin approval)
    $query = "INSERT INTO users (email, password, first_name, last_name, phone, status) 
              VALUES (:email, :password, :first_name, :last_name, :phone, 'pending')";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password', $password);
    $stmt->bindParam(':first_name', $firstName);
    $stmt->bindParam(':last_name', $lastName);
    $stmt->bindParam(':phone', $phone);
    
} else {
    // Seller registration
    if (!isset($data->email) || !isset($data->password) || !isset($data->business_name) || !isset($data->owner_name)) {
        Response::validationError([
            'email' => 'Email is required',
            'password' => 'Password is required',
            'business_name' => 'Business name is required',
            'owner_name' => 'Owner name is required'
        ]);
    }
    
    $email = trim($data->email);
    $password = Auth::hashPassword($data->password);
    $businessName = trim($data->business_name);
    $ownerName = trim($data->owner_name);
    $phone = $data->phone ?? null;
    $businessType = $data->business_type ?? 'individual';
    $businessDescription = $data->business_description ?? null;
    $businessPermit = $data->business_permit ?? null;
    
    // Check if email exists
    $checkQuery = "SELECT id FROM sellers WHERE email = :email";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        Response::error('Email already exists', 409);
    }
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Insert seller
        $query = "INSERT INTO sellers (email, password, business_name, owner_name, phone, business_type, business_description, business_permit) 
                  VALUES (:email, :password, :business_name, :owner_name, :phone, :business_type, :business_description, :business_permit)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':business_name', $businessName);
        $stmt->bindParam(':owner_name', $ownerName);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':business_type', $businessType);
        $stmt->bindParam(':business_description', $businessDescription);
        $stmt->bindParam(':business_permit', $businessPermit);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to create seller account');
        }
        
        $sellerId = $db->lastInsertId();
        
        // Insert business address if provided
        if (isset($data->province) && isset($data->municipality) && isset($data->barangay)) {
            $addressQuery = "INSERT INTO addresses (seller_id, address_type, first_name, last_name, phone, address_line_1, barangay, city, province, is_default)
                            VALUES (:seller_id, 'business', :first_name, :last_name, :phone, :address_line_1, :barangay, :city, :province, 1)";
            
            $addressStmt = $db->prepare($addressQuery);
            $addressStmt->bindParam(':seller_id', $sellerId);
            $addressStmt->bindParam(':first_name', $ownerName);
            $addressStmt->bindParam(':last_name', $ownerName);
            $addressStmt->bindParam(':phone', $phone);
            $addressStmt->bindValue(':address_line_1', 'Business Address');
            $addressStmt->bindParam(':barangay', $data->barangay);
            $addressStmt->bindParam(':city', $data->municipality);
            $addressStmt->bindParam(':province', $data->province);
            
            $addressStmt->execute();
        }
        
        // Commit transaction
        $db->commit();
        
        // Get created seller
        $getUserQuery = "SELECT * FROM sellers WHERE id = :id";
        $getUserStmt = $db->prepare($getUserQuery);
        $getUserStmt->bindParam(':id', $sellerId);
        $getUserStmt->execute();
        
        $user = $getUserStmt->fetch();
        unset($user['password']);
        
        // For sellers, don't create session yet - wait for admin approval
        Response::success([
            'user' => $user,
            'token' => null,
            'message' => 'Registration successful! Your account is pending admin approval. You will be notified once verified.',
            'user_type' => 'seller'
        ], 'Registration successful - Pending approval', 201);
        
    } catch (Exception $e) {
        $db->rollBack();
        Response::serverError('Registration failed: ' . $e->getMessage());
    }
}

// Execute registration for users (customers)
if ($userType === 'user' && $stmt->execute()) {
    $userId = $db->lastInsertId();
    
    // Create session
    $auth = new Auth();
    $session = $auth->createSession($userId, $userType);
    
    // Get created user
    $getUserQuery = "SELECT * FROM users WHERE id = :id";
    $getUserStmt = $db->prepare($getUserQuery);
    $getUserStmt->bindParam(':id', $userId);
    $getUserStmt->execute();
    
    $user = $getUserStmt->fetch();
    unset($user['password']);
    
    Response::success([
        'user' => $user,
        'token' => $session['token'],
        'expires_at' => $session['expires_at'],
        'user_type' => $userType
    ], 'Registration successful', 201);
} elseif ($userType === 'user') {
    Response::serverError('Registration failed');
}

