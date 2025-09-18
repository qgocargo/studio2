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
            if ($user['role'] !== 'admin') {
                 send_json(['message' => 'Permission denied for analytics.'], 403);
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

try {
    // Summary Metrics
    $summary_query = "SELECT 
                        COUNT(*) as totalJobs, 
                        SUM(totalProfit) as totalProfit,
                        SUM(totalCost) as totalCost,
                        SUM(totalSelling) as totalSelling
                      FROM job_files 
                      WHERE is_deleted = 0";
    $summary_result = $db->query($summary_query);
    $summary = $summary_result->fetch_assoc();

    // Monthly Profit
    $monthly_profit_query = "SELECT 
                                DATE_FORMAT(d, '%Y-%m') as month,
                                SUM(totalProfit) as totalProfit
                             FROM job_files 
                             WHERE is_deleted = 0 AND d IS NOT NULL
                             GROUP BY month
                             ORDER BY month ASC";
    $monthly_profit_result = $db->query($monthly_profit_query);
    $monthlyProfit = [];
    while($row = $monthly_profit_result->fetch_assoc()) {
        $monthlyProfit[] = $row;
    }

    // Salesman Performance
    $salesman_query = "SELECT 
                         sm as salesman,
                         COUNT(*) as jobCount,
                         SUM(totalProfit) as totalProfit
                       FROM job_files 
                       WHERE is_deleted = 0 AND sm IS NOT NULL AND sm != ''
                       GROUP BY sm
                       ORDER BY totalProfit DESC";
    $salesman_result = $db->query($salesman_query);
    $salesmanPerformance = [];
     while($row = $salesman_result->fetch_assoc()) {
        $salesmanPerformance[] = $row;
    }

    send_json([
        'summary' => $summary,
        'monthlyProfit' => $monthlyProfit,
        'salesmanPerformance' => $salesmanPerformance
    ]);

} catch (Exception $e) {
    send_json(['message' => 'Failed to fetch analytics data: ' . $e->getMessage()], 500);
}
?>
