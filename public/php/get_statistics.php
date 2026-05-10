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
    // Get aggregated statistics
    $stmt = $conn->prepare("
        SELECT 
            COUNT(stat_id) as total_quizzes,
            COALESCE(SUM(score), 0) as total_score,
            COALESCE(SUM(yen), 0) as total_yen_earned,
            COALESCE(MAX(score), 0) as highest_score,
            COALESCE(AVG(score), 0) as average_score
        FROM statistics 
        WHERE player_id = ?
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $aggregates = $result->fetch_assoc();
    $stmt->close();

    // Get recent quizzes (last 5)
    $stmt = $conn->prepare("
        SELECT score, yen, updated_at 
        FROM statistics 
        WHERE player_id = ? 
        ORDER BY updated_at DESC 
        LIMIT 5
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $recent_result = $stmt->get_result();
    
    $recent_quizzes = [];
    while ($row = $recent_result->fetch_assoc()) {
        $recent_quizzes[] = $row;
    }
    $stmt->close();

    echo json_encode([
        'success' => true, 
        'aggregates' => [
            'total_quizzes' => (int)$aggregates['total_quizzes'],
            'total_score' => (int)$aggregates['total_score'],
            'total_yen_earned' => (int)$aggregates['total_yen_earned'],
            'highest_score' => (int)$aggregates['highest_score'],
            'average_score' => round((float)$aggregates['average_score'], 2)
        ],
        'recent_quizzes' => $recent_quizzes
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
ob_end_flush();
?>
