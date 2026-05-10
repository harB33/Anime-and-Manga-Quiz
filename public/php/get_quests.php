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

$user_id = $_SESSION['user_id'];

try {
    // 1. Get all claimed timestamps
    $stmt = $conn->prepare("SELECT quest_id, last_claimed FROM player_quests WHERE player_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $claimed_quests = [];
    while ($row = $result->fetch_assoc()) {
        $claimed_quests[$row['quest_id']] = $row['last_claimed'];
    }
    $stmt->close();
    
    // 2. Build the full quests payload with progress
    $quests_payload = [];
    $current_time_str = date('Y-m-d H:i:s');
    
    foreach ($QUESTS_CONFIG as $category => $quests_list) {
        $quests_payload[$category] = [];
        foreach ($quests_list as $quest_id => $q) {
            $last_claimed = isset($claimed_quests[$quest_id]) ? $claimed_quests[$quest_id] : null;
            $progress_count = 0;
            
            // Check requirement progress
            if (isset($q['requirement'])) {
                $req = $q['requirement'];
                $time_condition = "";
                $params = [$user_id];
                $types = "i";
                
                // If it was claimed before, only count quizzes AFTER the claim
                if ($last_claimed) {
                    $time_condition = " AND updated_at > ?";
                    $params[] = $last_claimed;
                    $types .= "s";
                }
                
                if ($req['type'] === 'play_quiz') {
                    $stmt = $conn->prepare("SELECT COUNT(*) as cnt FROM statistics WHERE player_id = ?" . $time_condition);
                } else if ($req['type'] === 'play_category') {
                    $stmt = $conn->prepare("SELECT COUNT(*) as cnt FROM statistics WHERE player_id = ? AND category_id = ?" . $time_condition);
                    // Insert category_id parameter before the time parameter
                    array_splice($params, 1, 0, [$req['category_id']]);
                    $types = substr_replace($types, 'i', 1, 0);
                }
                
                if (isset($stmt)) {
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $res = $stmt->get_result();
                    if ($row = $res->fetch_assoc()) {
                        $progress_count = (int)$row['cnt'];
                    }
                    $stmt->close();
                }
            }
            
            $q['last_claimed'] = $last_claimed;
            $q['progress'] = $progress_count;
            $quests_payload[$category][] = $q;
        }
    }
    
    echo json_encode([
        'success' => true, 
        'quests' => $quests_payload,
        'cooldowns' => $COOLDOWNS,
        'server_time' => $current_time_str
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
ob_end_flush();
?>
