<?php
ob_start();
require_once __DIR__ . '/../db/db.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated', 'yen' => 0]);
    ob_end_flush();
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT yen FROM players WHERE player_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($yen);

if ($stmt->fetch()) {
    echo json_encode(['success' => true, 'yen' => $yen]);
} else {
    echo json_encode(['success' => false, 'error' => 'User not found', 'yen' => 0]);
}

$stmt->close();
$conn->close();
ob_end_flush();
?>
