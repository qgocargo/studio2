<?php
require_once 'db.php';
require_once 'auth-helper.php'; // A new file to keep JWT validation logic

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
$user = get_current_user(); // This will exit if user is not authenticated
$db = DB::getInstance()->getConnection();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_all':
        $result = $db->query("SELECT * FROM job_files WHERE is_deleted = 0 ORDER BY updatedAt DESC");
        $files = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $files[] = $row;
            }
        }
        send_json(['jobFiles' => $files]);
        break;

    case 'get':
        $id = $db->real_escape_string($_GET['id'] ?? '');
        $result = $db->query("SELECT * FROM job_files WHERE jfn = '$id' AND is_deleted = 0");
        if ($result && $file = $result->fetch_assoc()) {
            send_json(['jobFile' => $file]);
        } else {
            send_json(['message' => 'File not found'], 404);
        }
        break;

    case 'create':
        $data = get_input();
        // TODO: Add proper validation and sanitization
        $jfn = $db->real_escape_string($data['jfn']);
        // ... get all other fields
        $ch = json_encode($data['ch']);
        $cl = json_encode($data['cl']);
        $pt = json_encode($data['pt']);
        $createdBy = $user['displayName'];
        
        $stmt = $db->prepare("INSERT INTO job_files (jfn, ch, cl, pt, createdBy, status) VALUES (?, ?, ?, ?, ?, 'pending')");
        $stmt->bind_param("sssss", $jfn, $ch, $cl, $pt, $createdBy);
        
        if ($stmt->execute()) {
            send_json(['status' => 'success', 'jobFile' => ['jfn' => $jfn]], 201);
        } else {
            send_json(['message' => 'Failed to create job file: ' . $db->error], 500);
        }
        break;

    // Implement update, delete, check, approve, etc. actions
    
    default:
        send_json(['message' => 'Invalid action for job-files.'], 400);
        break;
}
?>