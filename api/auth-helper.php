<?php
// This would be a new file to reuse the authentication logic
require_once 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function get_current_user() {
    $jwt_key = 'YOUR_SUPER_SECRET_JWT_KEY'; // TODO: Same key as in auth.php
    $headers = getallheaders();
    
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['message' => 'Authorization header missing.']);
        exit;
    }

    $authHeader = $headers['Authorization'];
    list($jwt) = sscanf($authHeader, 'Bearer %s');

    if (!$jwt) {
        http_response_code(401);
        echo json_encode(['message' => 'Token not found.']);
        exit;
    }

    try {
        $decoded = JWT::decode($jwt, new Key($jwt_key, 'HS256'));
        $userId = $decoded->data->userId;
        
        // You might want to fetch fresh user data from DB
        $db = DB::getInstance()->getConnection();
        $result = $db->query("SELECT id, displayName, role, status FROM users WHERE id = $userId");
        if ($user = $result->fetch_assoc()) {
            return $user;
        } else {
            throw new Exception('User not found.');
        }

    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['message' => 'Invalid token: ' . $e->getMessage()]);
        exit;
    }
}
?>