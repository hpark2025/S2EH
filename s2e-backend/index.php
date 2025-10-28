<?php
/**
 * S2EH Backend API
 * Main entry point and router
 */

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/Response.php';

// Simple API info
Response::success([
    'name' => 'S2EH Backend API',
    'version' => '1.0.0',
    'description' => 'Sagnay to Export Hub - MySQL Backend API',
    'endpoints' => [
        'auth' => [
            'POST /api/auth/login' => 'Login user/seller/admin',
            'POST /api/auth/register' => 'Register user/seller',
            'GET /api/auth/me' => 'Get current user',
            'POST /api/auth/logout' => 'Logout user'
        ],
        'products' => [
            'GET /api/products' => 'Get all products (public)',
            'POST /api/products/create' => 'Create product (seller only)'
        ],
        'categories' => [
            'GET /api/categories' => 'Get all categories (public)'
        ],
        'orders' => [
            'GET /api/orders' => 'Get user orders (authenticated)',
            'POST /api/orders/create' => 'Create order (customer only)'
        ]
    ],
    'database' => [
        'status' => 'connected',
        'info' => (new Database())->testConnection()
    ]
], 'S2EH API is running');

