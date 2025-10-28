<?php
/**
 * Logout Endpoint
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

// Get token from header
$headers = apache_request_headers();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

if (!$authHeader) {
    Response::unauthorized();
}

$token = str_replace('Bearer ', '', $authHeader);

// Delete session
$auth = new Auth();
if ($auth->deleteSession($token)) {
    Response::success(null, 'Logout successful');
} else {
    Response::serverError('Logout failed');
}

