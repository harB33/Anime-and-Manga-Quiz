<?php
ob_start();
require_once __DIR__ . '/../db/db.php';
require_once __DIR__ . '/quests_config.php';

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
$quest_id = isset($_POST['quest_id']) ? $_POST['quest_id'] : '';

$user_id = $_SESSION['user_id'];

// Find quest in config
$quest = null;
$quest_type = null;
foreach ($QUESTS_CONFIG as $cat => $quests_list) {
    if (isset($quests_list[$quest_id])) {
        $quest = $quests_list[$quest_id];
        $quest_type = $cat;
        break;
    }
}

if (!$quest) {
    echo json_encode(['success' => false, 'error' => 'Invalid quest']);
    ob_end_flush();
    exit;
}

$reward = $quest['reward'];
$cooldown_seconds = $COOLDOWNS[$quest_type];

$conn->begin_transaction();

try {
    // Check last claimed time using pessimistic locking
    $stmt = $conn->prepare("SELECT last_claimed FROM player_quests WHERE player_id = ? AND quest_id = ? FOR UPDATE");
    $stmt->bind_param("is", $user_id, $quest_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $last_claimed_timestamp = null;
    $last_claimed_raw = null;
    $can_claim = true;
    if ($row = $result->fetch_assoc()) {
        $last_claimed_raw = $row['last_claimed'];
        $last_claimed_timestamp = strtotime($last_claimed_raw);
        $current_time = time();
        if ($current_time - $last_claimed_timestamp < $cooldown_seconds) {
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

    // Verify requirement
    if (isset($quest['requirement'])) {
        $req = $quest['requirement'];
        $time_condition = "";
        $params = [$user_id];
        $types = "i";
        
        if ($last_claimed_raw) {
            $time_condition = " AND updated_at > ?";
            $params[] = $last_claimed_raw;
            $types .= "s";
        }
        
        $stmt_req = null;
        if ($req['type'] === 'play_quiz') {
            $stmt_req = $conn->prepare("SELECT COUNT(*) as cnt FROM statistics WHERE player_id = ?" . $time_condition);
        } else if ($req['type'] === 'play_category') {
            $stmt_req = $conn->prepare("SELECT COUNT(*) as cnt FROM statistics WHERE player_id = ? AND category_id = ?" . $time_condition);
            array_splice($params, 1, 0, [$req['category_id']]);
            $types = substr_replace($types, 'i', 1, 0);
        }
        
        $progress_count = 0;
        if ($stmt_req) {
            $stmt_req->bind_param($types, ...$params);
            $stmt_req->execute();
            $res = $stmt_req->get_result();
            if ($row = $res->fetch_assoc()) {
                $progress_count = (int)$row['cnt'];
            }
            $stmt_req->close();
        }

        if ($progress_count < $req['count']) {
            $conn->rollback();
            echo json_encode(['success' => false, 'error' => 'Quest requirements not met']);
            ob_end_flush();
            exit;
        }
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
