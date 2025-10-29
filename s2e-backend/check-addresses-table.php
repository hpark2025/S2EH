<?php
// Quick check for addresses table structure
require_once __DIR__ . '/config/database.php';

header('Content-Type: text/plain');

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "=== CHECKING ADDRESSES TABLE ===\n\n";
    
    // Check if columns exist
    $query = "SHOW COLUMNS FROM addresses LIKE '%code%'";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($columns)) {
        echo "❌ PSGC code columns NOT FOUND!\n";
        echo "\n⚠️  PLEASE RUN THIS SQL IN phpMyAdmin:\n\n";
        echo "ALTER TABLE addresses \n";
        echo "ADD COLUMN barangay_code VARCHAR(20) AFTER barangay,\n";
        echo "ADD COLUMN municipality_code VARCHAR(20) AFTER municipality,\n";
        echo "ADD COLUMN province_code VARCHAR(20) AFTER province;\n\n";
    } else {
        echo "✅ PSGC code columns found:\n";
        foreach ($columns as $col) {
            echo "   - " . $col['Field'] . " (" . $col['Type'] . ")\n";
        }
        echo "\n✅ Table is ready for geocoding!\n";
    }
    
    // Show full table structure
    echo "\n=== FULL TABLE STRUCTURE ===\n\n";
    $query = "DESCRIBE addresses";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    printf("%-25s %-20s %-10s %-10s\n", "Field", "Type", "Null", "Key");
    echo str_repeat("-", 70) . "\n";
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        printf("%-25s %-20s %-10s %-10s\n", 
            $row['Field'], 
            $row['Type'], 
            $row['Null'], 
            $row['Key']
        );
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

