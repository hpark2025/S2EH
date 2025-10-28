<?php
/**
 * CORS Configuration
 * Allow frontend (port 5173) to access backend API
 */

// Allow from any origin (for development)
// Support both port 5173 and 5174
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
if (in_array($origin, ['http://localhost:5173', 'http://localhost:5174'])) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:5174");
}

// Allow credentials (cookies, authorization headers)
header("Access-Control-Allow-Credentials: true");

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

