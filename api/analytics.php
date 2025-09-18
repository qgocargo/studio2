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
            if ($user['role'] !== 'admin' && $user['role'] !== 'checker') {
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
    $where_clause = "WHERE is_deleted = 0";
    $date_type = $_GET['date_type'] ?? 'bd';
    $timeframe = $_GET['timeframe'] ?? 'all';

    if ($timeframe !== 'all') {
        $date_col = $date_type === 'd' ? 'd' : 'bd';
        $now = new DateTime();
        $current_year = $now->format('Y');
        
        if ($timeframe === 'thisYear') {
            $where_clause .= " AND YEAR($date_col) = $current_year";
        } elseif ($timeframe === 'lastYear') {
            $last_year = $current_year - 1;
            $where_clause .= " AND YEAR($date_col) = $last_year";
        } elseif (preg_match('/^\d{4}-\d{2}$/', $timeframe)) { // Monthly filter e.g., '2024-05'
             $where_clause .= " AND DATE_FORMAT($date_col, '%Y-%m') = '$timeframe'";
        }
    }
    
    // All job files for the selected period for client-side filtering and tables
    $all_jobs_query = "SELECT * FROM job_files $where_clause ORDER BY updatedAt DESC";
    $all_jobs_result = $db->query($all_jobs_query);
    $allJobs = [];
    while($row = $all_jobs_result->fetch_assoc()) {
        $allJobs[] = $row;
    }


    // Summary Metrics
    $summary_query = "SELECT 
                        COUNT(*) as totalJobs, 
                        SUM(totalProfit) as totalProfit,
                        SUM(totalCost) as totalCost,
                        SUM(totalSelling) as totalSelling
                      FROM job_files 
                      $where_clause";
    $summary_result = $db->query($summary_query);
    $summary = $summary_result->fetch_assoc();
    
    // Top 5 Shippers by Profit
    $shipper_query = "SELECT sh as name, SUM(totalProfit) as profit FROM job_files $where_clause AND sh IS NOT NULL AND sh != '' GROUP BY sh ORDER BY profit DESC LIMIT 5";
    $shipper_result = $db->query($shipper_query);
    $topShippers = [];
    while($row = $shipper_result->fetch_assoc()) { $topShippers[] = $row; }
    
    // Top 5 Consignees by Profit
    $consignee_query = "SELECT co as name, SUM(totalProfit) as profit FROM job_files $where_clause AND co IS NOT NULL AND co != '' GROUP BY co ORDER BY profit DESC LIMIT 5";
    $consignee_result = $db->query($consignee_query);
    $topConsignees = [];
    while($row = $consignee_result->fetch_assoc()) { $topConsignees[] = $row; }
    
    // Top Salesmen by Profit
    $salesman_query = "SELECT sm as name, COUNT(*) as count, SUM(totalProfit) as profit FROM job_files $where_clause AND sm IS NOT NULL AND sm != '' GROUP BY sm ORDER BY profit DESC";
    $salesman_result = $db->query($salesman_query);
    $topSalesmen = [];
    while($row = $salesman_result->fetch_assoc()) { $topSalesmen[] = $row; }
    
    // Top Users by Profit
    $user_query = "SELECT createdBy as name, COUNT(*) as count, SUM(totalProfit) as profit FROM job_files $where_clause AND createdBy IS NOT NULL AND createdBy != '' GROUP BY createdBy ORDER BY profit DESC";
    $user_result = $db->query($user_query);
    $topUsers = [];
    while($row = $user_result->fetch_assoc()) { $topUsers[] = $row; }

    // Monthly Stats
    $monthly_date_col = $date_type === 'd' ? 'd' : 'bd';
    $monthly_stats_query = "SELECT DATE_FORMAT($monthly_date_col, '%Y-%m') as month, COUNT(*) as count, SUM(totalProfit) as profit FROM job_files $where_clause AND $monthly_date_col IS NOT NULL GROUP BY month ORDER BY month ASC";
    $monthly_stats_result = $db->query($monthly_stats_query);
    $monthlyStats = [];
    while($row = $monthly_stats_result->fetch_assoc()) { $monthlyStats[] = $row; }


    send_json([
        'allJobs' => $allJobs,
        'summary' => $summary,
        'topShippers' => $topShippers,
        'topConsignees' => $topConsignees,
        'topSalesmen' => $topSalesmen,
        'topUsers' => $topUsers,
        'monthlyStats' => $monthlyStats
    ]);

} catch (Exception $e) {
    send_json(['message' => 'Failed to fetch analytics data: ' . $e->getMessage()], 500);
}
?>
    