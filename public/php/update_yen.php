<?php
ob_start();
require_once __DIR__ . '/../db/db.php';

header('Content-Type: application/json');

session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    ob_end_flush();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $yenEarned = isset($_POST['yenEarned']) ? (int)$_POST['yenEarned'] : 0;
    $score = isset($_POST['score']) ? (int)$_POST['score'] : 0;
    $categoryId = !empty($_POST['categoryId']) ? (int)$_POST['categoryId'] : null;
    $difficulty = !empty($_POST['difficulty']) ? $_POST['difficulty'] : null;

    $user_id = $_SESSION['user_id'];

    // Start transaction
    $conn->begin_transaction();

    try {
        // Insert into statistics table
        $stmt = $conn->prepare("INSERT INTO statistics (player_id, category_id, difficulty, score, yen) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("iisii", $user_id, $categoryId, $difficulty, $score, $yenEarned);
        $stmt->execute();
        $stmt->close();

        if ($yenEarned > 0) {
            // Update players table
            $stmt = $conn->prepare("UPDATE players SET yen = yen + ? WHERE player_id = ?");
            $stmt->bind_param("ii", $yenEarned, $user_id);
            $stmt->execute();
            $stmt->close();
        }

        // Fetch new balance
        $stmt = $conn->prepare("SELECT yen FROM players WHERE player_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->bind_result($newYen);
        $stmt->fetch();
        $stmt->close();

        $conn->commit();

        echo json_encode(['success' => true, 'yen' => $newYen, 'added' => $yenEarned, 'score' => $score]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}

$conn->close();
ob_end_flush();
?>
