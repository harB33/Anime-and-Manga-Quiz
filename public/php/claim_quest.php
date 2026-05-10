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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    ob_end_flush();
    exit;
}

// Express's handlePHP bridge converts all request bodies (including JSON) into application/x-www-form-urlencoded
// So we must read from $_POST instead of parsing php://input as JSON.
$quest_id = isset($_POST['quest_id']) ? $_POST['quest_id'] : '';
// Define quests and their rewards
$quests = [
    // Hourly
    'hourly_1' => ['type' => 'hourly', 'reward' => 50],
    'hourly_2' => ['type' => 'hourly', 'reward' => 60],
    'hourly_3' => ['type' => 'hourly', 'reward' => 70],
    'hourly_4' => ['type' => 'hourly', 'reward' => 80],
    'hourly_5' => ['type' => 'hourly', 'reward' => 100],
    // Daily
    'daily_1' => ['type' => 'daily', 'reward' => 200],
    'daily_2' => ['type' => 'daily', 'reward' => 250],
    'daily_3' => ['type' => 'daily', 'reward' => 300],
    'daily_4' => ['type' => 'daily', 'reward' => 400],
    'daily_5' => ['type' => 'daily', 'reward' => 500],
    // Weekly
    'weekly_1' => ['type' => 'weekly', 'reward' => 1000],
    'weekly_2' => ['type' => 'weekly', 'reward' => 1200],
    'weekly_3' => ['type' => 'weekly', 'reward' => 1500],
    'weekly_4' => ['type' => 'weekly', 'reward' => 2000],
    'weekly_5' => ['type' => 'weekly', 'reward' => 3000],
];

if (!isset($quests[$quest_id])) {
    echo json_encode(['success' => false, 'error' => 'Invalid quest']);
    ob_end_flush();
    exit;
}

$quest = $quests[$quest_id];
$user_id = $_SESSION['user_id'];
$reward = $quest['reward'];

// Define cooldowns
$cooldowns = [
    'hourly' => 3600, // 1 hour
    'daily' => 86400, // 24 hours
    'weekly' => 604800 // 7 days
];
$cooldown_seconds = $cooldowns[$quest['type']];

$conn->begin_transaction();

try {
    // Check last claimed time using pessimistic locking to prevent race conditions
    $stmt = $conn->prepare("SELECT last_claimed FROM player_quests WHERE player_id = ? AND quest_id = ? FOR UPDATE");
    $stmt->bind_param("is", $user_id, $quest_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $can_claim = true;
    if ($row = $result->fetch_assoc()) {
        $last_claimed = strtotime($row['last_claimed']);
        $current_time = time();
        if ($current_time - $last_claimed < $cooldown_seconds) {
            $can_claim = false;
        }
    }
    $stmt->close();

    if (!$can_claim) {
        $conn->rollback();
        echo json_encode(['success' => false, 'error' => 'Quest is on cooldown']);
        ob_end_flush();
        exit;
    }

    // Insert or update last_claimed
    $current_date = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("INSERT INTO player_quests (player_id, quest_id, last_claimed) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE last_claimed = ?");
    $stmt->bind_param("isss", $user_id, $quest_id, $current_date, $current_date);
    $stmt->execute();
    $stmt->close();

    // Reward Yen
    $stmt = $conn->prepare("UPDATE players SET yen = yen + ? WHERE player_id = ?");
    $stmt->bind_param("ii", $reward, $user_id);
    $stmt->execute();
    $stmt->close();

    // Fetch new yen balance
    $stmt = $conn->prepare("SELECT yen FROM players WHERE player_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($newYen);
    $stmt->fetch();
    $stmt->close();

    $conn->commit();

    echo json_encode(['success' => true, 'yen' => $newYen, 'reward' => $reward, 'last_claimed' => $current_date]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
ob_end_flush();
?>
