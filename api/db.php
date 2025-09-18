<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

class DB {
    private static $instance = null;
    private $conn;

    // TODO: Replace with your actual database credentials from your hosting provider (e.g., Hostinger)
    private $host = 'localhost'; // Usually 'localhost'
    private $user = 'db_user';     // CHANGE THIS: Your database username
    private $pass = 'db_password'; // CHANGE THIS: Your database password
    private $name = 'db_name';     // CHANGE THIS: Your database name

    private function __construct() {
        $this->conn = new mysqli($this->host, $this->user, $this->pass, $this->name);
        if ($this->conn->connect_error) {
            die("Connection failed: " . $this->conn->connect_error);
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