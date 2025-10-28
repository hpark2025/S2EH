<?php
/**
 * Quick Test File
 * Test database connection and API setup
 */

header("Content-Type: application/json; charset=UTF-8");

echo "<h1>S2EH Backend Test</h1>";
echo "<hr>";

// Test 1: Database Connection
echo "<h2>1. Database Connection Test</h2>";
require_once __DIR__ . '/config/database.php';

$database = new Database();
$result = $database->testConnection();

if ($result['success']) {
    echo "<p style='color: green;'>✅ " . $result['message'] . "</p>";
    echo "<p>Database: <strong>" . $result['database'] . "</strong></p>";
    echo "<p>Host: <strong>" . $result['host'] . "</strong></p>";
} else {
    echo "<p style='color: red;'>❌ " . $result['message'] . "</p>";
}

// Test 2: Check Tables
echo "<h2>2. Database Tables Check</h2>";
try {
    $db = $database->getConnection();
    $tables = ['users', 'sellers', 'admins', 'products', 'categories', 'orders', 'cart', 'sessions'];
    
    echo "<ul>";
    foreach ($tables as $table) {
        $query = "SHOW TABLES LIKE '{$table}'";
        $stmt = $db->query($query);
        if ($stmt->rowCount() > 0) {
            // Count rows
            $countQuery = "SELECT COUNT(*) as count FROM {$table}";
            $countStmt = $db->query($countQuery);
            $count = $countStmt->fetch()['count'];
            
            echo "<li style='color: green;'>✅ Table <strong>{$table}</strong> exists ({$count} rows)</li>";
        } else {
            echo "<li style='color: red;'>❌ Table <strong>{$table}</strong> NOT found</li>";
        }
    }
    echo "</ul>";
} catch (Exception $e) {
    echo "<p style='color: red;'>Error checking tables: " . $e->getMessage() . "</p>";
}

// Test 3: Categories Check
echo "<h2>3. Sample Categories</h2>";
try {
    $query = "SELECT * FROM categories WHERE is_active = 1";
    $stmt = $db->query($query);
    $categories = $stmt->fetchAll();
    
    if (count($categories) > 0) {
        echo "<p style='color: green;'>✅ Found " . count($categories) . " categories:</p>";
        echo "<ul>";
        foreach ($categories as $cat) {
            echo "<li><strong>{$cat['name']}</strong> ({$cat['slug']})</li>";
        }
        echo "</ul>";
    } else {
        echo "<p style='color: orange;'>⚠️ No categories found. Run the SQL schema to insert sample data.</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}

// Test 4: API Endpoints
echo "<h2>4. API Endpoints</h2>";
echo "<p>Test these URLs in your browser or Postman:</p>";
echo "<ul>";
echo "<li><a href='http://localhost:8080/S2EH/s2e-backend/' target='_blank'>Main API Info</a></li>";
echo "<li><a href='http://localhost:8080/S2EH/s2e-backend/api/categories' target='_blank'>GET Categories</a></li>";
echo "<li><a href='http://localhost:8080/S2EH/s2e-backend/api/products' target='_blank'>GET Products</a></li>";
echo "</ul>";

echo "<h2>5. Next Steps</h2>";
echo "<ol>";
echo "<li>If all tests pass, your backend is ready! ✅</li>";
echo "<li>Start the frontend: <code>npm run dev</code> in the frontend folder</li>";
echo "<li>Access frontend at: <a href='http://localhost:5173' target='_blank'>http://localhost:5173</a></li>";
echo "<li>Test API login/register from the frontend</li>";
echo "</ol>";

echo "<hr>";
echo "<p><em>Built for S2EH - Sagnay to Export Hub</em></p>";

