<?php
require_once 'db.php';
// You will need a JWT library, e.g., firebase/php-jwt
// Run `composer require firebase/php-jwt` in your `api` directory
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

// --- Main Logic ---
$db = DB::getInstance()->getConnection();
$action = $_GET['action'] ?? '';
$jwt_key = 'QgoCargoApiSecretKey@2024!_S$uper_S#ecure'; // Secure key has been set.

switch ($action) {
    case 'login':
        $input = get_input();
        $email = $db->real_escape_string($input['email']);
        $password = $input['password'];

        $result = $db->query("SELECT * FROM users WHERE email = '$email'");
        if ($result && $user = $result->fetch_assoc()) {
            if (password_verify($password, $user['password_hash'])) {
                unset($user['password_hash']);
                $payload = [
                    'iss' => "your_app_name", // Issuer
                    'aud' => "your_app_name", // Audience
                    'iat' => time(), // Issued at
                    'exp' => time() + (60*60*24), // Expiration time (1 day)
                    'data' => ['userId' => $user['id']]
                ];
                $jwt = JWT::encode($payload, $jwt_key, 'HS256');
                send_json(['status' => 'success', 'token' => $jwt, 'user' => $user]);
            }
        }
        send_json(['message' => 'Invalid email or password.'], 401);
        break;

    case 'register':
        // TODO: Implement registration logic
        send_json(['message' => 'Registration endpoint not implemented.'], 501);
        break;

    case 'check_token':
        // TODO: Implement token check logic
        send_json(['message' => 'Token check not implemented.'], 501);
        break;
        
    // Other cases for forgot_password, etc.
    default:
        send_json(['message' => 'Invalid action.'], 400);
        break;
}
?>