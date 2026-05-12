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

function getItemType(string $name, string $description): string {
    $name = strtolower($name);
    $description = strtolower($description);

    if (str_contains($name, 'title') || str_contains($description, 'title')) {
        return 'title';
    }
    if (str_contains($name, 'border') || str_contains($description, 'border')) {
        return 'border';
    }
    if (str_contains($name, 'double yen') || str_contains($description, 'double yen') || str_contains($name, 'yen') || str_contains($description, 'yen')) {
        return 'powerup';
    }
    if (str_contains($name, 'hint') || str_contains($description, 'hint')) {
        return 'hint';
    }
    if (str_contains($name, 'boost') || str_contains($description, 'power')) {
        return 'powerup';
    }

    return 'misc';
}

function getCurrentEquipmentState(): array {
    $state = [
        'equippedTitle' => $_SESSION['equipped_title'] ?? null,
        'equippedBorder' => $_SESSION['equipped_border'] ?? null,
        'hintBalance' => $_SESSION['hint_balance'] ?? 0,
        'activePowerup' => null,
    ];

    if (isset($_SESSION['powerup_expires_at']) && isset($_SESSION['active_powerup'])) {
        $expiresAt = (int)$_SESSION['powerup_expires_at'];
        if ($expiresAt > time()) {
            $state['activePowerup'] = [
                'name' => $_SESSION['active_powerup'],
                'expiresAt' => date('c', $expiresAt)
            ];
        } else {
            unset($_SESSION['active_powerup'], $_SESSION['powerup_expires_at']);
        }
    }

    return $state;
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
            'obtained_at' => $row['obtained_at'],
            'type' => getItemType($row['item_name'], $row['item_description']),
        ];
    }
    $stmt->close();
    
    echo json_encode([
        'success' => true,
        'inventory' => $inventory,
        'equipment' => getCurrentEquipmentState(),
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
ob_end_flush();
?>
