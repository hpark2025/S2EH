<?php
/**
 * Admin Password Reset Script
 * Use this to reset admin password to: password123
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Auth.php';

$database = new Database();
$db = $database->getConnection();

// New password
$newPassword = 'password123';
$email = 'admin@s2eh.local';

// Hash the new password
$hashedPassword = Auth::hashPassword($newPassword);

// Update admin password
$query = "UPDATE admins SET password = :password WHERE email = :email";
$stmt = $db->prepare($query);
$stmt->bindParam(':password', $hashedPassword);
$stmt->bindParam(':email', $email);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    echo "✅ Admin password updated successfully!\n";
    echo "Email: {$email}\n";
    echo "New Password: {$newPassword}\n";
    echo "Hashed Password: {$hashedPassword}\n";
} else {
    echo "❌ Admin not found or password already set.\n";
    echo "Please check if admin exists with email: {$email}\n";
}

