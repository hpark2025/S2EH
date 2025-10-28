<?php
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'Seller endpoint test successful!',
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI']
]);

