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
    $res = $conn->query("SELECT item_id, item_name, item_description, price, image_url, rarity FROM items ORDER BY item_id ASC");
    $items = [];
    while ($row = $res->fetch_assoc()) {
        $items[] = [
            'id' => (int)$row['item_id'],
            'name' => $row['item_name'],
            'description' => $row['item_description'],
            'price' => (int)$row['price'],
            'image_url' => $row['image_url'] ? $row['image_url'] : '/images/anime_merch_figure.png',
            'rarity' => $row['rarity'] ? $row['rarity'] : 'Common'
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
