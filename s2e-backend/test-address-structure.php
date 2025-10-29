<?php
// Quick test to check addresses table structure

require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=== ADDRESSES TABLE STRUCTURE ===\n\n";

$query = "DESCRIBE addresses";
$stmt = $db->prepare($query);
$stmt->execute();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo sprintf("%-25s %-20s %-10s %-10s\n", 
        $row['Field'], 
        $row['Type'], 
        $row['Null'], 
        $row['Key']
    );
}

echo "\n=== SAMPLE ADDRESSES DATA ===\n\n";

$query = "SELECT * FROM addresses ORDER BY created_at DESC LIMIT 3";
$stmt = $db->prepare($query);
$stmt->execute();

$addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($addresses)) {
    echo "No addresses found in database.\n";
} else {
    foreach ($addresses as $addr) {
        print_r($addr);
        echo "\n---\n\n";
    }
}

