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

function get_input() {
    return json_decode(file_get_contents('php://input'), true);
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
            if ($user['status'] !== 'active') {
                send_json(['message' => 'User account is not active.'], 403);
            }
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
    send_json(['message' => 'Access denied. Admin role required.'], 403);
}

$db = DB::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $db->query("SELECT id, email, displayName, role, status FROM users ORDER BY displayName");
    $users = [];
    if ($result) {
        while($row = $result->fetch_assoc()){
            $users[] = $row;
        }
    }
    send_json(['users' => $users]);

} elseif ($method === 'PUT') {
    $data = get_input();
    if (!isset($data['users']) || !is_array($data['users'])) {
        send_json(['message' => 'Invalid data format. Expected an array of users.'], 400);
    }
    
    $db->begin_transaction();
    try {
        $stmt = $db->prepare("UPDATE users SET displayName=?, role=?, status=? WHERE id=?");
        foreach ($data['users'] as $userData) {
            // Prevent admin from de-activating or changing their own role
            if ($userData['id'] == $user['id']) {
                $userData['role'] = 'admin';
                $userData['status'] = 'active';
            }
            $stmt->bind_param("sssi", $userData['displayName'], $userData['role'], $userData['status'], $userData['id']);
            $stmt->execute();
        }
        $db->commit();
        send_json(['status' => 'success']);
    } catch (Exception $e) {
        $db->rollback();
        send_json(['message' => 'Failed to update users: ' . $e->getMessage()], 500);
    }
} else {
    send_json(['message' => 'Invalid request method for users.'], 405);
}
?>