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

$item_id = isset($_POST['item_id']) ? (int)$_POST['item_id'] : 0;
$user_id = $_SESSION['user_id'];

if ($item_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid item id']);
    ob_end_flush();
    exit;
}

try {
    $stmt = $conn->prepare("SELECT item_name, item_description FROM shop WHERE item_id = ?");
    $stmt->bind_param('i', $item_id);
    $stmt->execute();
    $stmt->bind_result($item_name, $item_description);
    if (!$stmt->fetch()) {
        throw new Exception('Item not found');
    }
    $stmt->close();

    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM inventory WHERE player_id = ? AND item_id = ?");
    $stmt->bind_param('ii', $user_id, $item_id);
    $stmt->execute();
    $stmt->bind_result($owned_count);
    $stmt->fetch();
    $stmt->close();

    if ($owned_count <= 0) {
        throw new Exception('You do not own this item');
    }

    $type = getItemType($item_name, $item_description);

    if ($type === 'title') {
        if (isset($_SESSION['equipped_title']) && $_SESSION['equipped_title'] === $item_name) {
            unset($_SESSION['equipped_title']);
            $message = 'Title unequipped!';
        } else {
            $_SESSION['equipped_title'] = $item_name;
            $message = 'Title equipped!';
        }
    } elseif ($type === 'border') {
        if (isset($_SESSION['equipped_border']) && $_SESSION['equipped_border'] === $item_name) {
            unset($_SESSION['equipped_border']);
            $message = 'Border unequipped!';
        } else {
            $_SESSION['equipped_border'] = $item_name;
            $message = 'Border equipped!';
        }
    } elseif ($type === 'powerup') {
        $expiresAt = time() + 3600;
        $_SESSION['active_powerup'] = $item_name;
        $_SESSION['powerup_expires_at'] = $expiresAt;

        $deleteStmt = $conn->prepare("DELETE FROM inventory WHERE player_id = ? AND item_id = ? ORDER BY obtained_at ASC LIMIT 1");
        $deleteStmt->bind_param('ii', $user_id, $item_id);
        $deleteStmt->execute();
        $deleteStmt->close();

        $message = 'Power-up used! Double Yen active for 1 hour.';
    } elseif ($type === 'hint') {
        $_SESSION['hint_balance'] = ($_SESSION['hint_balance'] ?? 0) + 5;
        $deleteStmt = $conn->prepare("DELETE FROM inventory WHERE player_id = ? AND item_id = ? ORDER BY obtained_at ASC LIMIT 1");
        $deleteStmt->bind_param('ii', $user_id, $item_id);
        $deleteStmt->execute();
        $deleteStmt->close();

        $message = 'Hint pack used! You gained 5 hints.';
    } else {
        throw new Exception('This item cannot be used or equipped yet');
    }

    echo json_encode(array_merge(['success' => true, 'message' => $message], getCurrentEquipmentState()));
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
ob_end_flush();
?>