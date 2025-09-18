<?php
require_once 'db.php';
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;


// --- Helper Functions ---
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
$db = DB::getInstance()->getConnection();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_all':
        $result = $db->query("SELECT * FROM clients ORDER BY name ASC");
        $clients = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $clients[] = $row;
            }
        }
        send_json(['clients' => $clients]);
        break;
    
    // Implement create, update, delete actions for clients

    default:
        send_json(['message' => 'Invalid action for clients.'], 400);
        break;
}
?>
