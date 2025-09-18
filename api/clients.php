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
$db = DB::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $db->query("SELECT * FROM clients ORDER BY name ASC");
    $clients = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $clients[] = $row;
        }
    }
    send_json(['clients' => $clients]);

} elseif ($method === 'POST') {
    $data = get_input();
    $name = $db->real_escape_string($data['name']);
    if (empty($name)) send_json(['message' => 'Client name is required.'], 400);

    $stmt = $db->prepare("INSERT INTO clients (name, address, contactPerson, phone, type) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $name, $data['address'], $data['contactPerson'], $data['phone'], $data['type']);
    
    if ($stmt->execute()) {
        $newId = $db->insert_id;
        $result = $db->query("SELECT * FROM clients WHERE id = $newId");
        send_json(['client' => $result->fetch_assoc()], 201);
    } else {
        send_json(['message' => 'Failed to create client.'], 500);
    }

} elseif ($method === 'PUT') {
    $id = $_GET['id'] ?? '';
    if (empty($id)) send_json(['message' => 'Client ID is required.'], 400);
    
    $data = get_input();
    $name = $db->real_escape_string($data['name']);
    if (empty($name)) send_json(['message' => 'Client name is required.'], 400);

    $stmt = $db->prepare("UPDATE clients SET name=?, address=?, contactPerson=?, phone=?, type=? WHERE id=?");
    $stmt->bind_param("sssssi", $name, $data['address'], $data['contactPerson'], $data['phone'], $data['type'], $id);

    if ($stmt->execute()) {
        $result = $db->query("SELECT * FROM clients WHERE id = $id");
        send_json(['client' => $result->fetch_assoc()]);
    } else {
        send_json(['message' => 'Failed to update client.'], 500);
    }

} elseif ($method === 'DELETE') {
    if ($user['role'] !== 'admin') send_json(['message' => 'Permission denied.'], 403);
    
    $id = $_GET['id'] ?? '';
    if (empty($id)) send_json(['message' => 'Client ID is required.'], 400);

    $stmt = $db->prepare("DELETE FROM clients WHERE id=?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        send_json(null, 204);
    } else {
        send_json(['message' => 'Failed to delete client.'], 500);
    }

} else {
    send_json(['message' => 'Invalid request method.'], 405);
}
?>