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
$rawInput = file_get_contents("php://input");
error_log("📥 Raw registration input: " . $rawInput);

$data = json_decode($rawInput);
error_log("📦 Decoded data object: " . json_encode($data));
error_log("📦 Has metadata? " . (isset($data->metadata) ? 'YES' : 'NO'));
if (isset($data->metadata)) {
    error_log("📦 Metadata content: " . json_encode($data->metadata));
    error_log("📦 Has metadata->address? " . (isset($data->metadata->address) ? 'YES' : 'NO'));
    if (isset($data->metadata->address)) {
        error_log("📦 Address content: " . json_encode($data->metadata->address));
    }
}

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
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Insert user with pending status (requires admin approval)
        $query = "INSERT INTO users (email, password, first_name, last_name, phone, status) 
                  VALUES (:email, :password, :first_name, :last_name, :phone, 'pending')";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':first_name', $firstName);
        $stmt->bindParam(':last_name', $lastName);
        $stmt->bindParam(':phone', $phone);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to create user account');
        }
        
        $userId = $db->lastInsertId();
        
        // Insert address if provided
        if (isset($data->metadata->address)) {
            $address = $data->metadata->address;
            error_log("Address data received: " . json_encode($address));
            
            // Check if at least one address field has a value (not null, not empty)
            $hasAddressData = (!empty($address->province) || !empty($address->municipality) || !empty($address->barangay));
            
            if ($hasAddressData) {
                try {
                    $addressQuery = "INSERT INTO addresses (
                        user_id, address_type, first_name, last_name, phone,
                        province, province_code, municipality, municipality_code, 
                        barangay, barangay_code, postal_code, is_default
                    ) VALUES (
                        :user_id, 'shipping', :first_name, :last_name, :phone,
                        :province, :province_code, :municipality, :municipality_code,
                        :barangay, :barangay_code, :postal_code, 1
                    )";
                    
                    $addressStmt = $db->prepare($addressQuery);
                    $addressStmt->bindParam(':user_id', $userId);
                    $addressStmt->bindParam(':first_name', $firstName);
                    $addressStmt->bindParam(':last_name', $lastName);
                    $addressStmt->bindParam(':phone', $phone);
                    $addressStmt->bindValue(':province', $address->province ?? null);
                    $addressStmt->bindValue(':province_code', $address->province_code ?? null);
                    $addressStmt->bindValue(':municipality', $address->municipality ?? null);
                    $addressStmt->bindValue(':municipality_code', $address->municipality_code ?? null);
                    $addressStmt->bindValue(':barangay', $address->barangay ?? null);
                    $addressStmt->bindValue(':barangay_code', $address->barangay_code ?? null);
                    $addressStmt->bindValue(':postal_code', $address->postal_code ?? null);
                    
                    if (!$addressStmt->execute()) {
                        $errorInfo = $addressStmt->errorInfo();
                        error_log("Address insert failed: " . json_encode($errorInfo));
                        throw new Exception('Failed to save address: ' . $errorInfo[2]);
                    }
                    
                    error_log("Address saved successfully for user ID: " . $userId);
                } catch (Exception $e) {
                    error_log("Address save error: " . $e->getMessage());
                    throw $e;
                }
            } else {
                error_log("No valid address data provided. Province: " . ($address->province ?? 'null') . 
                         ", Municipality: " . ($address->municipality ?? 'null') . 
                         ", Barangay: " . ($address->barangay ?? 'null'));
            }
        } else {
            error_log("No metadata.address in request");
        }
        
        // Commit transaction
        $db->commit();
        
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
        
    } catch (Exception $e) {
        $db->rollBack();
        Response::serverError('Registration failed: ' . $e->getMessage());
    }
    
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
        
        // Insert business address if provided (with PSGC codes)
        if (isset($data->province) && isset($data->municipality) && isset($data->barangay)) {
            // Extract PSGC codes from the data
            $provinceCode = $data->province_code ?? null;
            $municipalityCode = $data->municipality_code ?? null;
            $barangayCode = $data->barangay_code ?? null;
            
            // Get names (these should be provided by frontend)
            $provinceName = $data->province ?? null;
            $municipalityName = $data->municipality ?? null;
            $barangayName = $data->barangay ?? null;
            
            $addressQuery = "INSERT INTO addresses (
                                seller_id, 
                                address_type, 
                                first_name, 
                                last_name, 
                                phone, 
                                address_line_1, 
                                barangay, 
                                barangay_code,
                                municipality, 
                                municipality_code,
                                city,
                                province, 
                                province_code,
                                is_default
                            )
                            VALUES (
                                :seller_id, 
                                'business', 
                                :first_name, 
                                :last_name, 
                                :phone, 
                                :address_line_1, 
                                :barangay, 
                                :barangay_code,
                                :municipality, 
                                :municipality_code,
                                :city,
                                :province, 
                                :province_code,
                                1
                            )";
            
            $addressStmt = $db->prepare($addressQuery);
            $addressStmt->bindParam(':seller_id', $sellerId);
            $addressStmt->bindParam(':first_name', $ownerName);
            $addressStmt->bindParam(':last_name', $ownerName);
            $addressStmt->bindParam(':phone', $phone);
            $addressStmt->bindValue(':address_line_1', 'Business Address');
            $addressStmt->bindParam(':barangay', $barangayName);
            $addressStmt->bindParam(':barangay_code', $barangayCode);
            $addressStmt->bindParam(':municipality', $municipalityName);
            $addressStmt->bindParam(':municipality_code', $municipalityCode);
            $addressStmt->bindParam(':city', $municipalityName); // City is same as municipality name
            $addressStmt->bindParam(':province', $provinceName);
            $addressStmt->bindParam(':province_code', $provinceCode);
            
            if (!$addressStmt->execute()) {
                error_log('❌ Failed to insert seller business address');
                throw new Exception('Failed to save business address');
            }
            
            error_log('✅ Saved seller business address with PSGC codes for seller_id: ' . $sellerId);
            error_log('📍 Province: ' . $provinceName . ' (Code: ' . $provinceCode . ')');
            error_log('📍 Municipality: ' . $municipalityName . ' (Code: ' . $municipalityCode . ')');
            error_log('📍 Barangay: ' . $barangayName . ' (Code: ' . $barangayCode . ')');
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
