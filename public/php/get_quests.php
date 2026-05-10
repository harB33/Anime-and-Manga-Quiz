<?php
ob_start();
require_once __DIR__ . '/../db/db.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    ob_end_flush();
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $stmt = $conn->prepare("SELECT quest_id, last_claimed FROM player_quests WHERE player_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $quests = [];
    while ($row = $result->fetch_assoc()) {
        $quests[$row['quest_id']] = $row['last_claimed'];
    }
    $stmt->close();
    
    // Also return current server time so frontend can sync exactly
    echo json_encode([
        'success' => true, 
        'quests' => $quests,
        'server_time' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
ob_end_flush();
?>
