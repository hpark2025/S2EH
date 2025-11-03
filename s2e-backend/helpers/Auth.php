<?php
/**
 * Authentication Helper
 * JWT-like session token management
 */

require_once __DIR__ . '/../config/database.php';

class Auth {
    private $db;
    private $conn;
    
    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }
    
    /**
     * Generate random token
     */
    private function generateToken() {
        return bin2hex(random_bytes(32));
    }
    
    /**
     * Hash password
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }
    
    /**
     * Verify password
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Create session and return token
     */
    public function createSession($userId, $userType) {
        $token = $this->generateToken();
        $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        $userIdField = $userType . '_id';
        
        $query = "INSERT INTO sessions (token, user_type, {$userIdField}, ip_address, user_agent, expires_at) 
                  VALUES (:token, :user_type, :user_id, :ip_address, :user_agent, :expires_at)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->bindParam(':user_type', $userType);
        $stmt->bindParam(':user_id', $userId);
        
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
        
        $stmt->bindParam(':ip_address', $ipAddress);
        $stmt->bindParam(':user_agent', $userAgent);
        $stmt->bindParam(':expires_at', $expiresAt);
        
        if ($stmt->execute()) {
            return [
                'token' => $token,
                'expires_at' => $expiresAt
            ];
        }
        
        return false;
    }
    
    /**
     * Verify token and get user
     */
    public function verifyToken($token) {
        $query = "SELECT * FROM sessions WHERE token = :token AND expires_at > NOW()";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        return $stmt->fetch();
    }
    
    /**
     * Get current user from bearer token
     */
    public function getCurrentUser() {
        // Try multiple methods to get headers (works in different PHP configurations)
        $headers = [];
        
        // Method 1: getallheaders() - works in most configurations
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
        }
        // Method 2: apache_request_headers() - Apache module only
        elseif (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
        }
        
        // Normalize header keys to lowercase for case-insensitive lookup
        $headersLower = array_change_key_case($headers ?: [], CASE_LOWER);
        $authHeader = $headersLower['authorization'] ?? null;
        
        // Method 3: Check $_SERVER (set by .htaccess for CGI/FastCGI mode)
        if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }
        
        // Method 4: Check REDIRECT_HTTP_AUTHORIZATION (some Apache configs)
        if (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        
        if (!$authHeader) {
            error_log('⚠️ Auth::getCurrentUser - No Authorization header found');
            return null;
        }
        
        // Extract token from "Bearer TOKEN" (case-insensitive)
        $token = preg_replace('/^Bearer\s+/i', '', trim($authHeader));
        
        if (empty($token)) {
            error_log('⚠️ Auth::getCurrentUser - Token is empty after extraction');
            return null;
        }
        
        error_log('🔍 Auth::getCurrentUser - Token extracted: ' . substr($token, 0, 20) . '...');
        
        $session = $this->verifyToken($token);
        
        if (!$session) {
            error_log('⚠️ Auth::getCurrentUser - Session not found or expired for token');
            error_log('⚠️ Auth::getCurrentUser - Token length: ' . strlen($token));
            error_log('⚠️ Auth::getCurrentUser - Checking if token exists in sessions table...');
            
            // Debug: Check if token exists at all
            $debugQuery = "SELECT * FROM sessions WHERE token = :token LIMIT 1";
            $debugStmt = $this->conn->prepare($debugQuery);
            $debugStmt->bindParam(':token', $token);
            $debugStmt->execute();
            $debugSession = $debugStmt->fetch();
            
            if ($debugSession) {
                error_log('⚠️ Auth::getCurrentUser - Token found in DB but expired or invalid');
                error_log('⚠️ Auth::getCurrentUser - Session expires_at: ' . ($debugSession['expires_at'] ?? 'N/A'));
                error_log('⚠️ Auth::getCurrentUser - Current time: ' . date('Y-m-d H:i:s'));
            } else {
                error_log('⚠️ Auth::getCurrentUser - Token NOT found in sessions table at all');
            }
            
            return null;
        }
        
        // Get user data based on type
        $userType = $session['user_type'];
        $table = $userType . 's'; // users, sellers, admins
        $userId = $session[$userType . '_id'];
        
        $query = "SELECT * FROM {$table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        
        $user = $stmt->fetch();
        
        if ($user) {
            $user['user_type'] = $userType;
            unset($user['password']); // Remove password from response
            error_log('✅ Auth::getCurrentUser - User found: ID ' . $user['id'] . ', Type: ' . $userType);
        } else {
            error_log('⚠️ Auth::getCurrentUser - User not found in table ' . $table . ' with ID ' . $userId);
        }
        
        return $user;
    }
    
    /**
     * Delete session (logout)
     */
    public function deleteSession($token) {
        $query = "DELETE FROM sessions WHERE token = :token";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $token);
        return $stmt->execute();
    }
    
    /**
     * Clean expired sessions
     */
    public function cleanExpiredSessions() {
        $query = "DELETE FROM sessions WHERE expires_at < NOW()";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute();
    }
}

