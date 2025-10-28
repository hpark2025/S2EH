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
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        
        if (!$authHeader) {
            return null;
        }
        
        // Extract token from "Bearer TOKEN"
        $token = str_replace('Bearer ', '', $authHeader);
        
        $session = $this->verifyToken($token);
        
        if (!$session) {
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

