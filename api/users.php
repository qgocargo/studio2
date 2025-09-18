<?php
require_once 'db.php';
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function send_json($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function auth_guard() {
    $jwt_key = 'QgoCargoApiSecretKey@2024!_S$uper_S#ecure';
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        send_json(['message' => 'Authorization header missing.'], 401);
    }
    $authHeader = $headers['Authorization'];
    list($jwt) = sscanf($authHeader, 'Bearer %s');
    if (!$jwt) {
        send_json(['message' => 'Token not found.'], 401);
    }
    try {
        $decoded = JWT::decode($jwt, new Key($jwt_key, 'HS256'));
        $userId = $decoded->data->userId;
        $db = DB::getInstance()->getConnection();
        $result = $db->query("SELECT id, displayName, role, status FROM users WHERE id = $userId");
        if ($user = $result->fetch_assoc()) {
            return $user;
        } else {
            send_json(['message' => 'User from token not found.'], 401);
        }
    } catch (Exception $e) {
        send_json(['message' => 'Invalid token: ' . $e->getMessage()], 401);
    }
}

// --- Main Logic ---
$user = auth_guard();
if ($user['role'] !== 'admin') {
    send_json(['message' => 'Access denied.'], 403);
}

$db = DB::getInstance()->getConnection();
$action = $_GET['action'] ?? '';

switch($action) {
    case 'get_all':
        $result = $db->query("SELECT id, email, displayName, role, status FROM users");
        $users = [];
        if ($result) {
            while($row = $result->fetch_assoc()){
                $users[] = $row;
            }
        }
        send_json(['users' => $users]);
        break;
    
    // Implement update_batch action for users

    default:
        send_json(['message' => 'Invalid action for users.'], 400);
        break;
}
?>