<?php
/**
 * CORS Configuration
 * Allow frontend (port 5173) to access backend API
 */

// Allow from any origin (for development)
// Support both port 5173, 5174, and 5175
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    // Allow credentials only when we have a valid origin
    header("Access-Control-Allow-Credentials: true");
} else {
    // For public endpoints, allow all origins without credentials
    header("Access-Control-Allow-Origin: *");
}

// Allowed methods
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");

// Allowed headers
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Seller-ID, x-publishable-api-key");

// Set content type to JSON
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

