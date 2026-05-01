<?php
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
            header("Location: /");
            echo "Location: /\n";
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
?>
