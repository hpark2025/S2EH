<?php
/**
 * Orders API Endpoint
 * GET /api/orders - Get user orders
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Authenticate user
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user) {
    Response::unauthorized();
}

// Connect to database
$database = new Database();
$db = $database->getConnection();

// Debug: Log user info
error_log('🔍 User type: ' . ($user['user_type'] ?? 'N/A'));
error_log('🔍 User ID: ' . ($user['id'] ?? 'N/A'));

// Get orders based on user type
if ($user['user_type'] === 'user') {
    // Customer orders - include seller location data and shipping address
    // Note: We'll fetch seller address separately to handle cases where is_default might not be set
    $query = "SELECT o.*, 
                     s.business_name as seller_name,
                     s.id as seller_id,
                     addr.address_line_1 as shipping_address_line_1,
                     addr.address_line_2 as shipping_address_line_2,
                     addr.barangay as shipping_barangay,
                     addr.municipality as shipping_municipality,
                     addr.city as shipping_city,
                     addr.province as shipping_province,
                     addr.postal_code as shipping_postal_code
              FROM orders o
              LEFT JOIN sellers s ON o.seller_id = s.id
              LEFT JOIN addresses addr ON o.shipping_address_id = addr.id
              WHERE o.user_id = :user_id
              ORDER BY o.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    
} elseif ($user['user_type'] === 'seller') {
    // Seller orders - explicitly select customer data
    // Use explicit JOIN with proper type handling
    $query = "SELECT 
                o.id, 
                o.order_number, 
                o.user_id, 
                o.seller_id, 
                o.status, 
                o.payment_status,
                o.payment_method, 
                o.subtotal, 
                o.shipping_fee, 
                o.tax, 
                o.discount, 
                o.total,
                o.notes, 
                o.tracking_number, 
                o.created_at, 
                o.updated_at,
                o.shipping_address_id,
                o.billing_address_id,
                o.shipped_at,
                o.delivered_at,
                o.cancelled_at,
                COALESCE(u.first_name, '') as first_name,
                COALESCE(u.last_name, '') as last_name,
                COALESCE(u.email, '') as customer_email
              FROM orders o
              LEFT JOIN users u ON CAST(o.user_id AS UNSIGNED) = CAST(u.id AS UNSIGNED)
              WHERE o.seller_id = :seller_id
              ORDER BY o.created_at DESC";
    
    $stmt = $db->prepare($query);
    $sellerId = (int)$user['id'];
    error_log('🔍 Executing seller query with seller_id: ' . $sellerId);
    $stmt->bindParam(':seller_id', $sellerId, PDO::PARAM_INT);
    
} elseif ($user['user_type'] === 'admin') {
    // Admin - all orders
    $query = "SELECT o.*, 
                     u.first_name, u.last_name, u.email as customer_email,
                     s.business_name as seller_name
              FROM orders o
              LEFT JOIN users u ON o.user_id = u.id
              LEFT JOIN sellers s ON o.seller_id = s.id
              ORDER BY o.created_at DESC";
    
    $stmt = $db->prepare($query);
} else {
    Response::unauthorized();
}

$stmt->execute();
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Debug: Log first order to check customer data BEFORE processing items
if (!empty($orders)) {
    $firstOrder = $orders[0];
    error_log('📦 First order RAW (before items): ' . json_encode([
        'order_id' => $firstOrder['id'] ?? 'N/A',
        'user_id' => $firstOrder['user_id'] ?? 'N/A',
        'user_id_type' => gettype($firstOrder['user_id'] ?? null),
        'first_name' => $firstOrder['first_name'] ?? 'NULL',
        'first_name_type' => gettype($firstOrder['first_name'] ?? null),
        'last_name' => $firstOrder['last_name'] ?? 'NULL',
        'last_name_type' => gettype($firstOrder['last_name'] ?? null),
        'customer_email' => $firstOrder['customer_email'] ?? 'NULL',
        'customer_email_type' => gettype($firstOrder['customer_email'] ?? null)
    ]));
    
    // Test query to verify user exists
    if (isset($firstOrder['user_id'])) {
        $testUserId = (int)$firstOrder['user_id'];
        $testQuery = "SELECT id, first_name, last_name, email FROM users WHERE id = :user_id";
        $testStmt = $db->prepare($testQuery);
        $testStmt->bindParam(':user_id', $testUserId, PDO::PARAM_INT);
        $testStmt->execute();
        $testUser = $testStmt->fetch(PDO::FETCH_ASSOC);
        error_log('📦 Test user lookup for ID ' . $testUserId . ': ' . json_encode($testUser ?: 'USER NOT FOUND'));
    }
}

// Get order items for each order with product images and seller location
foreach ($orders as &$order) {
    $itemsQuery = "SELECT oi.*, p.thumbnail as product_image
                   FROM order_items oi 
                   LEFT JOIN products p ON oi.product_id = p.id
                   WHERE oi.order_id = :order_id";
    $itemsStmt = $db->prepare($itemsQuery);
    $itemsStmt->bindParam(':order_id', $order['id']);
    $itemsStmt->execute();
    
    $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Add complete seller address data to each item (for user/customer and admin orders)
    if ($user['user_type'] === 'user' || $user['user_type'] === 'admin') {
        // Always fetch seller address from addresses table (try default first, then any business address)
        if (!empty($order['seller_id'])) {
            // First try to get default business address
            $sellerAddrQuery = "SELECT address_line_1, address_line_2, barangay, municipality, city, province, postal_code 
                               FROM addresses 
                               WHERE seller_id = :seller_id AND address_type = 'business' AND is_default = 1
                               LIMIT 1";
            $sellerAddrStmt = $db->prepare($sellerAddrQuery);
            $sellerAddrStmt->bindParam(':seller_id', $order['seller_id'], PDO::PARAM_INT);
            $sellerAddrStmt->execute();
            $sellerAddr = $sellerAddrStmt->fetch(PDO::FETCH_ASSOC);
            
            // If no default address found, get any business address
            if (!$sellerAddr) {
                error_log('⚠️ No default business address found for seller_id ' . $order['seller_id'] . ', trying any business address...');
                $sellerAddrQuery = "SELECT address_line_1, address_line_2, barangay, municipality, city, province, postal_code 
                                   FROM addresses 
                                   WHERE seller_id = :seller_id AND address_type = 'business'
                                   ORDER BY is_default DESC, created_at DESC
                                   LIMIT 1";
                $sellerAddrStmt = $db->prepare($sellerAddrQuery);
                $sellerAddrStmt->bindParam(':seller_id', $order['seller_id'], PDO::PARAM_INT);
                $sellerAddrStmt->execute();
                $sellerAddr = $sellerAddrStmt->fetch(PDO::FETCH_ASSOC);
            }
            
            if ($sellerAddr) {
                error_log('✅ Found seller address for seller_id ' . $order['seller_id']);
                $order['seller_address_line_1'] = $sellerAddr['address_line_1'];
                $order['seller_address_line_2'] = $sellerAddr['address_line_2'];
                $order['seller_barangay'] = $sellerAddr['barangay'];
                $order['seller_municipality'] = $sellerAddr['municipality'];
                $order['seller_city'] = $sellerAddr['city'];
                $order['seller_province'] = $sellerAddr['province'];
                $order['seller_postal_code'] = $sellerAddr['postal_code'];
            } else {
                error_log('❌ No business address found in addresses table for seller_id ' . $order['seller_id']);
            }
        }
        
        // Add complete seller address to each item
        foreach ($items as &$item) {
            $item['seller_address_line_1'] = $order['seller_address_line_1'] ?? null;
            $item['seller_address_line_2'] = $order['seller_address_line_2'] ?? null;
            $item['seller_barangay'] = $order['seller_barangay'] ?? null;
            $item['seller_municipality'] = $order['seller_municipality'] ?? null;
            $item['seller_city'] = $order['seller_city'] ?? null;
            $item['seller_province'] = $order['seller_province'] ?? null;
            $item['seller_postal_code'] = $order['seller_postal_code'] ?? null;
        }
    }
    
    // Store shipping address data in order (for customer and admin orders)
    if ($user['user_type'] === 'user' || $user['user_type'] === 'admin') {
        error_log('🔍 Processing shipping address for order ID: ' . $order['id']);
        error_log('🔍 shipping_address_id: ' . ($order['shipping_address_id'] ?? 'NULL'));
        error_log('🔍 shipping_address_line_1 from JOIN: ' . ($order['shipping_address_line_1'] ?? 'NULL'));
        
        $order['shipping_address'] = null;
        
        // Always fetch shipping address from addresses table if shipping_address_id exists
        // This ensures we get the data even if JOIN didn't work
        if (!empty($order['shipping_address_id'])) {
            // If JOIN didn't populate fields, fetch from addresses table
            if (empty($order['shipping_address_line_1']) && empty($order['shipping_barangay'])) {
                error_log('🔍 JOIN didn\'t populate address, fetching from addresses table for ID: ' . $order['shipping_address_id']);
                $addrQuery = "SELECT address_line_1, address_line_2, barangay, municipality, province, postal_code 
                             FROM addresses 
                             WHERE id = :address_id";
                $addrStmt = $db->prepare($addrQuery);
                $addrStmt->bindParam(':address_id', $order['shipping_address_id'], PDO::PARAM_INT);
                $addrStmt->execute();
                $address = $addrStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($address) {
                    error_log('✅ Found address in addresses table');
                    $order['shipping_address_line_1'] = $address['address_line_1'];
                    $order['shipping_address_line_2'] = $address['address_line_2'];
                    $order['shipping_barangay'] = $address['barangay'];
                    $order['shipping_municipality'] = $address['municipality'];
                    $order['shipping_province'] = $address['province'];
                    $order['shipping_postal_code'] = $address['postal_code'];
                } else {
                    error_log('⚠️ Address not found in addresses table with ID: ' . $order['shipping_address_id']);
                }
            } else {
                error_log('✅ Shipping address already populated from JOIN');
            }
        } else {
            error_log('⚠️ No shipping_address_id found in order ID: ' . $order['id']);
        }
        
        // Format shipping address (complete address from addresses table)
        if ($order['shipping_address_line_1'] || $order['shipping_barangay']) {
            $order['shipping_address'] = [
                'address_line_1' => $order['shipping_address_line_1'] ?? '',
                'address_line_2' => $order['shipping_address_line_2'] ?? '',
                'barangay' => $order['shipping_barangay'] ?? '',
                'municipality' => $order['shipping_municipality'] ?? '',
                'city' => $order['shipping_city'] ?? '',
                'province' => $order['shipping_province'] ?? '',
                'postal_code' => $order['shipping_postal_code'] ?? ''
            ];
            error_log('✅ Formatted shipping_address for order ID: ' . $order['id']);
        } else {
            error_log('⚠️ No shipping address data available for order ID: ' . $order['id']);
        }
        
        // Format seller address (complete address from addresses table)
        if ($order['seller_barangay'] || $order['seller_province']) {
            $order['seller_address'] = [
                'address_line_1' => $order['seller_address_line_1'] ?? '',
                'address_line_2' => $order['seller_address_line_2'] ?? '',
                'barangay' => $order['seller_barangay'] ?? '',
                'municipality' => $order['seller_municipality'] ?? '',
                'city' => $order['seller_city'] ?? '',
                'province' => $order['seller_province'] ?? '',
                'postal_code' => $order['seller_postal_code'] ?? ''
            ];
            error_log('✅ Formatted seller_address for order ID: ' . $order['id']);
        } else {
            error_log('⚠️ No seller address data available for order ID: ' . $order['id']);
        }
        
        // Log both addresses
        error_log('🔍 Customer address - barangay: ' . ($order['shipping_barangay'] ?? 'NULL') . 
                  ', municipality: ' . ($order['shipping_municipality'] ?? 'NULL') . 
                  ', province: ' . ($order['shipping_province'] ?? 'NULL'));
        error_log('🔍 Seller address - barangay: ' . ($order['seller_barangay'] ?? 'NULL') . 
                  ', municipality: ' . ($order['seller_municipality'] ?? 'NULL') . 
                  ', province: ' . ($order['seller_province'] ?? 'NULL'));
    }
    
    $order['items'] = $items;
}

// Debug: Log first order AFTER processing items to verify fields are still there
if (!empty($orders)) {
    $firstOrder = $orders[0];
    error_log('📦 First order FINAL (after items): ' . json_encode([
        'order_id' => $firstOrder['id'] ?? 'N/A',
        'user_id' => $firstOrder['user_id'] ?? 'N/A',
        'first_name' => $firstOrder['first_name'] ?? 'NULL',
        'last_name' => $firstOrder['last_name'] ?? 'NULL',
        'customer_email' => $firstOrder['customer_email'] ?? 'NULL',
        'has_items' => isset($firstOrder['items'])
    ]));
}

// Fetch customer data separately if missing from JOIN (fallback)
foreach ($orders as &$order) {
    // If customer data is missing or empty, fetch it separately
    if (empty($order['first_name']) && empty($order['last_name']) && !empty($order['user_id'])) {
        $userId = (int)$order['user_id'];
        $customerQuery = "SELECT first_name, last_name, email FROM users WHERE id = :user_id LIMIT 1";
        $customerStmt = $db->prepare($customerQuery);
        $customerStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $customerStmt->execute();
        $customer = $customerStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($customer) {
            $order['first_name'] = $customer['first_name'] ?? '';
            $order['last_name'] = $customer['last_name'] ?? '';
            $order['customer_email'] = $customer['email'] ?? '';
            error_log('✅ Fetched customer data separately for order ' . ($order['id'] ?? 'unknown') . ': ' . json_encode($customer));
        } else {
            error_log('⚠️ WARNING: User not found for user_id ' . $userId . ' in order ' . ($order['id'] ?? 'unknown'));
        }
    }
    
    // Ensure fields exist even if empty
    if (!isset($order['first_name'])) {
        $order['first_name'] = '';
    }
    if (!isset($order['last_name'])) {
        $order['last_name'] = '';
    }
    if (!isset($order['customer_email'])) {
        $order['customer_email'] = '';
    }
}

Response::success(['orders' => $orders]);

