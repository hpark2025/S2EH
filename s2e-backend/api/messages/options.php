<?php
/**
 * OPTIONS Handler for Messages API
 * Handles CORS preflight requests without redirects
 * This is called directly from .htaccess for OPTIONS requests
 */

// Set CORS headers directly (before any redirects)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Seller-ID, x-publishable-api-key");
header("Content-Type: application/json; charset=UTF-8");

// Return 200 OK for OPTIONS preflight
http_response_code(200);
exit();

