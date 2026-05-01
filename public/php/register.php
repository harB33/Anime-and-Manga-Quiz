<?php
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
            // Redirect back to homepage on success
            header("Location: /");
            echo "Location: /\n";
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
?>
