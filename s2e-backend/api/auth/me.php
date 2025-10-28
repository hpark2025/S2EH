<?php
/**
 * Get Current User Endpoint
 * Returns currently authenticated user
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../helpers/Auth.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Get current user
$auth = new Auth();
$user = $auth->getCurrentUser();

if (!$user) {
    Response::unauthorized();
}

Response::success($user, 'User retrieved successfully');

