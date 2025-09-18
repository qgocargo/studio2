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

function get_current_user_from_token() {
    $jwt_key = 'QgoCargoApiSecretKey@2024!_S$uper_S#ecure';
    $headers = getallheaders();
    
    if (!isset($headers['Authorization'])) {
        return null;
    }

    $authHeader = $headers['Authorization'];
    list($jwt) = sscanf($authHeader, 'Bearer %s');

    if (!$jwt) {
        return null;
    }

    try {
        $decoded = JWT::decode($jwt, new Key($jwt_key, 'HS256'));
        $userId = $decoded->data->userId;
        
        $db = DB::getInstance()->getConnection();
        $result = $db->query("SELECT id, displayName, role, status FROM users WHERE id = $userId");
        if ($user = $result->fetch_assoc()) {
            return $user;
        }
        return null;
    } catch (Exception $e) {
        // Log error instead of returning null for better debugging if needed
        error_log("JWT Decode Error: " . $e->getMessage());
        return null;
    }
}


// --- Main Logic ---
$db = DB::getInstance()->getConnection();
$action = $_GET['action'] ?? '';
$jwt_key = 'QgoCargoApiSecretKey@2024!_S$uper_S#ecure';

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'POST':
            if ($action === 'login') {
                $input = get_input();
                $email = $db->real_escape_string($input['email']);
                $password = $input['password'];

                $result = $db->query("SELECT * FROM users WHERE email = '$email'");
                if ($result && $user = $result->fetch_assoc()) {
                    if (password_verify($password, $user['password_hash'])) {
                        // Password is correct, create JWT
                        unset($user['password_hash']); // Don't send hash to client
                        $payload = [
                            'iss' => "qgo_cargo_app", // Issuer
                            'aud' => "qgo_cargo_app", // Audience
                            'iat' => time(), // Issued at
                            'exp' => time() + (60*60*24*7), // Expiration time (7 days)
                            'data' => ['userId' => $user['id']]
                        ];
                        $jwt = JWT::encode($payload, $jwt_key, 'HS256');
                        send_json(['status' => 'success', 'token' => $jwt, 'user' => $user]);
                    }
                }
                send_json(['message' => 'Invalid email or password.'], 401);

            } elseif ($action === 'register') {
                $input = get_input();
                $email = $db->real_escape_string($input['email']);
                $displayName = $db->real_escape_string($input['displayName']);
                $password = $input['password'];

                if (empty($email) || empty($displayName) || empty($password)) {
                    send_json(['message' => 'All fields are required.'], 400);
                }

                // Check if user already exists
                $result = $db->query("SELECT id FROM users WHERE email = '$email'");
                if ($result && $result->num_rows > 0) {
                    send_json(['message' => 'An account with this email already exists.'], 409);
                }

                $password_hash = password_hash($password, PASSWORD_DEFAULT);

                // Check if this is the first user
                $userCountResult = $db->query("SELECT COUNT(*) as count FROM users");
                $isFirstUser = ($userCountResult->fetch_assoc()['count'] == 0);

                $role = $isFirstUser ? 'admin' : 'user';
                $status = $isFirstUser ? 'active' : 'inactive';

                $stmt = $db->prepare("INSERT INTO users (email, displayName, password_hash, role, status) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("sssss", $email, $displayName, $password_hash, $role, $status);

                if ($stmt->execute()) {
                    send_json(['message' => 'Registration successful. You can now log in.'], 201);
                } else {
                    send_json(['message' => 'Registration failed: ' . $db->error], 500);
                }
            }
            break;

        case 'GET':
            if ($action === 'check_token') {
                $user = get_current_user_from_token();
                if ($user) {
                     send_json(['user' => $user]);
                } else {
                    send_json(['message' => 'Invalid or expired token.'], 401);
                }
            }
            break;

        default:
            send_json(['message' => 'Invalid request method or action.'], 400);
            break;
    }
} catch (Exception $e) {
    send_json(['message' => 'A server error occurred: ' . $e->getMessage()], 500);
}
?>