<?php
ob_start(); // Start output buffering to prevent "headers already sent" warnings
// Include the database connection file
require_once __DIR__ . '/../db/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['reg-username']) ? trim($_POST['reg-username']) : '';
    $email = isset($_POST['reg-email']) ? trim($_POST['reg-email']) : '';
    $password = isset($_POST['reg-password']) ? $_POST['reg-password'] : '';
    $yen = 0;

    if (!empty($username) && !empty($email) && !empty($password)) {
        // Hash password for security
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // SQL query to insert into the players table
        $stmt = $conn->prepare("INSERT INTO players (player_name, email, password, yen) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssi", $username, $email, $hashed_password, $yen);

        if ($stmt->execute()) {
            // Success: Set session and cookie
            session_start();
            $_SESSION['username'] = $username;
            $_SESSION['user_id'] = $stmt->insert_id;
            
            // Set cookie normally for PHP
            setcookie("username", $username, time() + (86400 * 30), "/"); 
            
            // Output special headers for Express bridge
            echo "\nX-Express-Header: Set-Cookie: username=" . urlencode($username) . "; Max-Age=" . (86400 * 30) . "; Path=/\n";
            echo "X-Express-Header: Location: /?registered=success\n";
            
            ob_end_flush();
            exit;
        } else {
            echo "Error during registration: " . $stmt->error;
        }
        $stmt->close();
    } else {
        echo "Please fill in all fields.";
    }
}
$conn->close();
ob_end_flush();
?>
