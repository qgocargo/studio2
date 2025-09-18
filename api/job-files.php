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
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && $action === 'get_all') {
    $result = $db->query("SELECT * FROM job_files WHERE is_deleted = 0 ORDER BY updatedAt DESC");
    $files = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $files[] = $row;
        }
    }
    send_json(['jobFiles' => $files]);

} elseif ($method === 'GET' && $action === 'get') {
    $id = $db->real_escape_string($_GET['id'] ?? '');
    if (empty($id)) {
        send_json(['message' => 'Job File ID is required.'], 400);
    }
    $result = $db->query("SELECT * FROM job_files WHERE jfn = '$id' AND is_deleted = 0");
    if ($result && $file = $result->fetch_assoc()) {
        send_json(['jobFile' => $file]);
    } else {
        send_json(['message' => 'File not found'], 404);
    }

} elseif ($method === 'POST' && $action === 'create') {
    $data = get_input();
    $jfn = $db->real_escape_string($data['jfn']);

    if (empty($jfn)) {
        send_json(['message' => 'Job File No. cannot be empty.'], 400);
    }
    // Check for duplicates
    $checkResult = $db->query("SELECT jfn FROM job_files WHERE jfn = '$jfn'");
    if ($checkResult && $checkResult->num_rows > 0) {
        send_json(['message' => "Job File No. '$jfn' already exists."], 409);
    }

    $stmt = $db->prepare("INSERT INTO job_files (jfn, d, po, cl, pt, `in`, bd, sm, sh, co, mawb, hawb, ts, `or`, pc, gw, de, vw, dsc, ca, tn, vn, fv, cn, ch, re, pb, createdBy, lastUpdatedBy, status, totalCost, totalSelling, totalProfit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)");
    
    $cl_json = json_encode($data['cl']);
    $pt_json = json_encode($data['pt']);
    $ch_json = json_encode($data['ch']);
    $createdBy = $user['displayName'];

    $stmt->bind_param("sssssssssssssssssssssssssssssdd", 
        $jfn, $data['d'], $data['po'], $cl_json, $pt_json, $data['in'], 
        $data['bd'], $data['sm'], $data['sh'], $data['co'], $data['mawb'], 
        $data['hawb'], $data['ts'], $data['or'], $data['pc'], $data['gw'], 
        $data['de'], $data['vw'], $data['dsc'], $data['ca'], $data['tn'], 
        $data['vn'], $data['fv'], $data['cn'], $ch_json, $data['re'], 
        $data['pb'], $createdBy, $createdBy, $data['totalCost'], $data['totalSelling'], $data['totalProfit']
    );
    
    if ($stmt->execute()) {
        $get_stmt = $db->query("SELECT * FROM job_files WHERE jfn = '$jfn'");
        $newFile = $get_stmt->fetch_assoc();
        send_json(['status' => 'success', 'jobFile' => $newFile], 201);
    } else {
        send_json(['message' => 'Failed to create job file: ' . $db->error], 500);
    }

} elseif ($method === 'PUT' && $action === 'update') {
    $id = $db->real_escape_string($_GET['id'] ?? '');
    if (empty($id)) {
        send_json(['message' => 'Job File ID is required for update.'], 400);
    }
    $data = get_input();
    
    $stmt = $db->prepare("UPDATE job_files SET d=?, po=?, cl=?, pt=?, `in`=?, bd=?, sm=?, sh=?, co=?, mawb=?, hawb=?, ts=?, `or`=?, pc=?, gw=?, de=?, vw=?, dsc=?, ca=?, tn=?, vn=?, fv=?, cn=?, ch=?, re=?, pb=?, lastUpdatedBy=?, totalCost=?, totalSelling=?, totalProfit=? WHERE jfn=?");
    
    $cl_json = json_encode($data['cl']);
    $pt_json = json_encode($data['pt']);
    $ch_json = json_encode($data['ch']);
    $lastUpdatedBy = $user['displayName'];

    $stmt->bind_param("ssssssssssssssssssssssssssdds", 
        $data['d'], $data['po'], $cl_json, $pt_json, $data['in'], 
        $data['bd'], $data['sm'], $data['sh'], $data['co'], $data['mawb'], 
        $data['hawb'], $data['ts'], $data['or'], $data['pc'], $data['gw'], 
        $data['de'], $data['vw'], $data['dsc'], $data['ca'], $data['tn'], 
        $data['vn'], $data['fv'], $data['cn'], $ch_json, $data['re'], 
        $data['pb'], $lastUpdatedBy, $data['totalCost'], $data['totalSelling'], $data['totalProfit'], $id
    );

    if ($stmt->execute()) {
        $get_stmt = $db->query("SELECT * FROM job_files WHERE jfn = '$id'");
        $updatedFile = $get_stmt->fetch_assoc();
        send_json(['status' => 'success', 'jobFile' => $updatedFile]);
    } else {
        send_json(['message' => 'Failed to update job file: ' . $db->error], 500);
    }

} elseif ($method === 'POST' && $action === 'check') {
    $id = $db->real_escape_string($_GET['id'] ?? '');
    if (empty($id)) { send_json(['message' => 'File ID is required.'], 400); }
    if ($user['role'] !== 'admin' && $user['role'] !== 'checker') { send_json(['message' => 'Permission denied.'], 403); }
    
    $checkedBy = $user['displayName'];
    $stmt = $db->prepare("UPDATE job_files SET status='checked', checkedBy=?, checkedAt=NOW() WHERE jfn=?");
    $stmt->bind_param("ss", $checkedBy, $id);
    
    if($stmt->execute() && $stmt->affected_rows > 0) {
        $get_stmt = $db->query("SELECT * FROM job_files WHERE jfn = '$id'");
        $file = $get_stmt->fetch_assoc();
        send_json(['jobFile' => $file]);
    } else {
        send_json(['message' => 'Could not check file or file not found.'], 404);
    }

} elseif ($method === 'POST' && $action === 'approve') {
    $id = $db->real_escape_string($_GET['id'] ?? '');
    if (empty($id)) { send_json(['message' => 'File ID is required.'], 400); }
    if ($user['role'] !== 'admin') { send_json(['message' => 'Permission denied.'], 403); }

    $approvedBy = $user['displayName'];
    $stmt = $db->prepare("UPDATE job_files SET status='approved', approvedBy=?, approvedAt=NOW() WHERE jfn=?");
    $stmt->bind_param("ss", $approvedBy, $id);
    
    if($stmt->execute() && $stmt->affected_rows > 0) {
        $get_stmt = $db->query("SELECT * FROM job_files WHERE jfn = '$id'");
        $file = $get_stmt->fetch_assoc();
        send_json(['jobFile' => $file]);
    } else {
        send_json(['message' => 'Could not approve file or file not found.'], 404);
    }

} else {
    send_json(['message' => 'Invalid action or request method.'], 400);
}
?>

    