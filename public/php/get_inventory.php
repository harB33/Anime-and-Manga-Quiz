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
    // Fetch all items from inventory for this user, joined with items table for details
    $stmt = $conn->prepare("
        SELECT i.item_id, i.item_name, i.item_description, i.image_url, i.rarity, inv.obtained_at 
        FROM inventory inv
        JOIN items i ON inv.item_id = i.item_id
        WHERE inv.player_id = ?
        ORDER BY inv.obtained_at DESC
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $inventory = [];
    while ($row = $result->fetch_assoc()) {
        $inventory[] = [
            'id' => (int)$row['item_id'],
            'name' => $row['item_name'],
            'description' => $row['item_description'],
            'image_url' => $row['image_url'] ? $row['image_url'] : '/images/anime_merch_figure.png',
            'rarity' => $row['rarity'],
            'obtained_at' => $row['obtained_at']
        ];
    }
    $stmt->close();
    
    echo json_encode([
        'success' => true,
        'inventory' => $inventory
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
ob_end_flush();
?>
