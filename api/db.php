<?php
header("Access-Control-Allow-Origin: *");
header("Access-control-allow-headers: *");
header("Access-Control-Allow-Methods: *");

require_once 'db-config.php'; // Include the new config file

class DB {
    private static $instance = null;
    private $conn;

    // Credentials are now in db-config.php
    private $host = DB_HOST;
    private $user = DB_USER;
    private $pass = DB_PASS;
    private $name = DB_NAME;

    private function __construct() {
        $this->conn = new mysqli($this->host, $this->user, $this->pass, $this->name);
        if ($this->conn->connect_error) {
            // Send a clear error message instead of just dying
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['message' => 'Database connection failed: ' . $this->conn->connect_error]);
            exit();
        }
    }

    public static function getInstance() {
        if (!self::$instance) {
            self::$instance = new DB();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
}
?>