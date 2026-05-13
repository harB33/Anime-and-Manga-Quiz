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
    $item_id = isset($_POST['item_id']) ? (int)$_POST['item_id'] : 0;
    $user_id = $_SESSION['user_id'];

    if ($item_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid item']);
        ob_end_flush();
        exit;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Fetch item price and type info
        $stmt = $conn->prepare("SELECT item_name, item_description, price FROM shop WHERE item_id = ?");
        $stmt->bind_param("i", $item_id);
        $stmt->execute();
        $stmt->bind_result($item_name, $item_description, $price);
        if (!$stmt->fetch()) {
            throw new Exception("Item not found");
        }
        $stmt->close();

        $type = 'misc';
        $lowerName = strtolower($item_name);
        $lowerDescription = strtolower($item_description);
        if (str_contains($lowerName, 'title') || str_contains($lowerDescription, 'title')) {
            $type = 'title';
        } elseif (str_contains($lowerName, 'border') || str_contains($lowerDescription, 'border')) {
            $type = 'border';
        } elseif (str_contains($lowerName, 'double yen') || str_contains($lowerDescription, 'double yen') || str_contains($lowerName, 'yen') || str_contains($lowerDescription, 'yen')) {
            $type = 'powerup';
        } elseif (str_contains($lowerName, 'hint') || str_contains($lowerDescription, 'hint')) {
            $type = 'hint';
        }

        // 1.5. Check if item already owned for equipables
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM inventory WHERE player_id = ? AND item_id = ?");
        $stmt->bind_param("ii", $user_id, $item_id);
        $stmt->execute();
        $stmt->bind_result($owned_count);
        $stmt->fetch();
        $stmt->close();
        
        if ($owned_count > 0 && ($type === 'title' || $type === 'border')) {
            throw new Exception("You already own this item");
        }

        // 2. Check user yen
        $stmt = $conn->prepare("SELECT yen FROM players WHERE player_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->bind_result($currentYen);
        if (!$stmt->fetch()) {
            throw new Exception("User not found");
        }
        $stmt->close();

        if ($currentYen < $price) {
            throw new Exception("Insufficient Yen balance");
        }

        // 3. Deduct yen
        $stmt = $conn->prepare("UPDATE players SET yen = yen - ? WHERE player_id = ?");
        $stmt->bind_param("ii", $price, $user_id);
        $stmt->execute();
        $stmt->close();

        // 4. Add to inventory
        $stmt = $conn->prepare("INSERT INTO inventory (player_id, item_id, obtained_at) VALUES (?, ?, NOW())");
        $stmt->bind_param("ii", $user_id, $item_id);
        $stmt->execute();
        $stmt->close();

        // 5. Fetch new balance
        $stmt = $conn->prepare("SELECT yen FROM players WHERE player_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->bind_result($newYen);
        $stmt->fetch();
        $stmt->close();

        $conn->commit();

        echo json_encode([
            'success' => true, 
            'yen' => $newYen, 
            'item_name' => $item_name,
            'cost' => $price
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}

$conn->close();
ob_end_flush();
?>
