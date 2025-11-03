<?php
/**
 * Seller Customers Endpoint
 * GET /api/seller/customers - Get seller's customers with stats
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Authenticate seller
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user || $user['user_type'] !== 'seller') {
    Response::unauthorized('Seller access required');
}

$sellerId = $user['id'];

// Connect to database
$database = new Database();
$db = $database->getConnection();

try {
    // Get customers with aggregated order data
    $query = "SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.created_at as customer_since,
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(o.total), 0) as total_spent,
                MAX(o.created_at) as last_order_date,
                MIN(o.created_at) as first_order_date,
                -- Calculate average rating from reviews (if reviews table exists)
                COALESCE((
                    SELECT AVG(rating)
                    FROM reviews r
                    WHERE r.user_id = u.id
                    AND EXISTS (
                        SELECT 1 FROM orders o2
                        WHERE o2.id = r.order_id
                        AND o2.seller_id = :seller_id1
                    )
                ), 0) as average_rating,
                COALESCE((
                    SELECT COUNT(*)
                    FROM reviews r
                    WHERE r.user_id = u.id
                    AND EXISTS (
                        SELECT 1 FROM orders o3
                        WHERE o3.id = r.order_id
                        AND o3.seller_id = :seller_id2
                    )
                ), 0) as rating_count
              FROM users u
              INNER JOIN orders o ON u.id = o.user_id
              WHERE o.seller_id = :seller_id
              GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.created_at
              ORDER BY total_spent DESC, last_order_date DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':seller_id', $sellerId, PDO::PARAM_INT);
    $stmt->bindParam(':seller_id1', $sellerId, PDO::PARAM_INT);
    $stmt->bindParam(':seller_id2', $sellerId, PDO::PARAM_INT);
    $stmt->execute();
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format customers data
    $formattedCustomers = [];
    foreach ($customers as $customer) {
        $totalOrders = (int)$customer['total_orders'];
        $totalSpent = (float)$customer['total_spent'];
        
        // Determine status based on order count
        $status = 'active';
        if ($totalOrders >= 10 && $totalSpent >= 10000) {
            $status = 'vip';
        } elseif ($totalOrders >= 3) {
            $status = 'repeat';
        } elseif ($totalOrders === 0) {
            $status = 'inactive';
        }
        
        // Get initials for avatar
        $firstName = $customer['first_name'] ?? '';
        $lastName = $customer['last_name'] ?? '';
        $initials = '';
        if ($firstName && $lastName) {
            $initials = strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));
        } elseif ($firstName) {
            $initials = strtoupper(substr($firstName, 0, 2));
        } elseif ($lastName) {
            $initials = strtoupper(substr($lastName, 0, 2));
        } else {
            $initials = '??';
        }
        
        // Format customer since date
        $customerSince = 'N/A';
        if ($customer['customer_since']) {
            $date = new DateTime($customer['customer_since']);
            $customerSince = $date->format('M Y');
        }
        
        // Format last order date
        $lastOrder = 'No orders yet';
        if ($customer['last_order_date']) {
            $date = new DateTime($customer['last_order_date']);
            $now = new DateTime();
            $diff = $now->diff($date);
            
            if ($diff->days === 0) {
                $lastOrder = 'Today';
            } elseif ($diff->days === 1) {
                $lastOrder = 'Yesterday';
            } elseif ($diff->days < 7) {
                $lastOrder = $diff->days . ' days ago';
            } elseif ($diff->days < 30) {
                $weeks = floor($diff->days / 7);
                $lastOrder = $weeks . ' week' . ($weeks > 1 ? 's' : '') . ' ago';
            } elseif ($diff->days < 365) {
                $months = floor($diff->days / 30);
                $lastOrder = $months . ' month' . ($months > 1 ? 's' : '') . ' ago';
            } else {
                $lastOrder = $date->format('M Y');
            }
        }
        
        $formattedCustomers[] = [
            'id' => (int)$customer['id'],
            'name' => trim(($customer['first_name'] ?? '') . ' ' . ($customer['last_name'] ?? '')),
            'email' => $customer['email'] ?? '',
            'phone' => $customer['phone'] ?? 'N/A',
            'totalOrders' => $totalOrders,
            'totalSpent' => $totalSpent,
            'lastOrder' => $lastOrder,
            'lastOrderDate' => $customer['last_order_date'],
            'status' => $status,
            'rating' => (float)$customer['average_rating'],
            'ratingCount' => (int)$customer['rating_count'],
            'customerSince' => $customerSince,
            'initials' => $initials
        ];
    }

    Response::success([
        'customers' => $formattedCustomers
    ], 'Customers fetched successfully');

} catch (Exception $e) {
    error_log('Seller Customers Error: ' . $e->getMessage());
    Response::error('Failed to fetch customers: ' . $e->getMessage(), 500);
}

