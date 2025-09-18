
      <?php
require_once 'db.php';
require_once 'auth-helper.php';

function send_json($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// --- Main Logic ---
$user = get_current_user();
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
    