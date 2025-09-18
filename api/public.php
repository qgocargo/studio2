<?php
require_once 'db.php';

function send_json($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

$db = DB::getInstance()->getConnection();
$jobId = $_GET['jobId'] ?? '';

if (empty($jobId)) {
    send_json(['message' => 'Job ID required.'], 400);
}

$escapedJobId = $db->real_escape_string($jobId);
$result = $db->query("SELECT * FROM job_files WHERE jfn = '$escapedJobId' AND is_deleted = 0");

if ($result && $file = $result->fetch_assoc()) {
    send_json(['jobFile' => $file]);
} else {
    send_json(['message' => 'Job file not found.'], 404);
}
?>