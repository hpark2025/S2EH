<?php
/**
 * Geocoding Proxy Endpoint
 * Fetches coordinates from Nominatim API
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../helpers/Response.php';

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Get location from query parameters
$location = $_GET['location'] ?? null;

if (!$location) {
    Response::validationError(['location' => 'Location parameter is required']);
}

// Nominatim API endpoint
$nominatimUrl = 'https://nominatim.openstreetmap.org/search';

// Build query parameters
$queryParams = http_build_query([
    'q' => $location,
    'format' => 'json',
    'limit' => 1,
    'countrycodes' => 'ph', // Philippines only
    'addressdetails' => 1 // Include address details (postal code, etc.)
]);

$url = $nominatimUrl . '?' . $queryParams;

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_USERAGENT => 'S2EH-Ecommerce-Platform/1.0',
    CURLOPT_SSL_VERIFYPEER => false // For development only
]);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

// Check for errors
if ($error) {
    error_log("Geocoding API Error: " . $error);
    Response::serverError('Failed to fetch coordinates: ' . $error);
}

if ($httpCode !== 200) {
    error_log("Geocoding API returned status: " . $httpCode);
    Response::serverError('Geocoding service returned error: ' . $httpCode);
}

// Decode response
$data = json_decode($response, true);

if (!$data || empty($data)) {
    // Return default Philippines center if location not found
    Response::success([
        'lat' => 12.8797,
        'lng' => 121.7740,
        'name' => 'Philippines',
        'found' => false
    ], 'Location not found, using default coordinates');
}

// Extract postal code from address details if available
$postalCode = null;
if (isset($data[0]['address'])) {
    $address = $data[0]['address'];
    $postalCode = $address['postcode'] ?? null;
}

// Return coordinates with postal code
Response::success([
    'lat' => floatval($data[0]['lat']),
    'lng' => floatval($data[0]['lon']),
    'name' => $location,
    'display_name' => $data[0]['display_name'] ?? $location,
    'postal_code' => $postalCode,
    'found' => true
], 'Coordinates fetched successfully');

