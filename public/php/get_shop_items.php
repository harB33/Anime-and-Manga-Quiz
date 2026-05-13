<?php
ob_start();
require_once __DIR__ . '/../db/db.php';

header('Content-Type: application/json');

session_start();

$is_admin = false;
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if ($user_id) {
    $stmt = $conn->prepare("SELECT role FROM players WHERE player_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        if ($row['role'] === 'admin') {
            $is_admin = true;
        }
    }
    $stmt->close();
}

try {
    $res = $conn->query("SELECT item_id, item_name, item_description, price, image_url, rarity FROM shop ORDER BY item_id ASC");
    $items = [];
    $ownedItemIds = [];

    // Get owned items only if user is logged in with valid ID
    if ($user_id && $user_id > 0) {
        $stmt = $conn->prepare("SELECT DISTINCT item_id FROM inventory WHERE player_id = ? AND item_id > 0");
        $stmt->bind_param("i", $user_id);
        if ($stmt->execute()) {
            $ownedResult = $stmt->get_result();
            while ($row = $ownedResult->fetch_assoc()) {
                $ownedItemIds[] = (int)$row['item_id'];
            }
        }
        $stmt->close();
    }

    while ($row = $res->fetch_assoc()) {
        $itemId = (int)$row['item_id'];
        $isOwned = false;
        
        // Only mark as owned if user is logged in and item is in their inventory
        if ($user_id && $user_id > 0 && count($ownedItemIds) > 0) {
            $isOwned = in_array($itemId, $ownedItemIds, true);
        }
        
        $items[] = [
            'id' => $itemId,
            'name' => $row['item_name'],
            'description' => $row['item_description'],
            'price' => (int)$row['price'],
            'image_url' => $row['image_url'] ? $row['image_url'] : '/images/anime_merch_figure.png',
            'rarity' => $row['rarity'] ? $row['rarity'] : 'Common',
            'owned' => $isOwned
        ];
    }
    
    echo json_encode([
        'success' => true,
        'is_admin' => $is_admin,
        'items' => $items
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
ob_end_flush();
?>
