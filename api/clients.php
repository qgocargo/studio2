<?php
require_once 'db.php';
require_once 'auth-helper.php';

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

// --- Main Logic ---
$user = get_current_user();
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