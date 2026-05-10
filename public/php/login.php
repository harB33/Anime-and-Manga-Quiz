<?php
ob_start(); // Start output buffering
// Include the database connection file
require_once __DIR__ . '/../db/db.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['login-username']);
    $password = $_POST['login-password'];

    if (!empty($username) && !empty($password)) {
        $stmt = $conn->prepare("SELECT player_id, password FROM players WHERE player_name = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $stmt->bind_result($user_id, $hashed_password);
        
        if ($stmt->fetch() && password_verify($password, $hashed_password)) {
            // Success: Store user ID or username in session
            $_SESSION['user_id'] = $user_id;
            $_SESSION['username'] = $username;
            
            // Set cookie for Express to read
            setcookie("username", $username, time() + (86400 * 30), "/"); // 30 days
            echo "\nX-Express-Header: Set-Cookie: username=" . urlencode($username) . "; Max-Age=" . (86400 * 30) . "; Path=/\n";
            echo "X-Express-Header: Set-Cookie: PHPSESSID=" . session_id() . "; Path=/\n";
            echo "X-Express-Header: Location: /?login=success\n";
            
            ob_end_flush();
            exit;
        } else {
            echo "Invalid username or password.";
        }
        $stmt->close();
    } else {
        echo "Please fill in all fields.";
    }
}
$conn->close();
ob_end_flush();
?>
