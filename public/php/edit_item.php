<?php
ob_start();
require_once __DIR__ . '/../db/db.php';
require_once __DIR__ . '/check_admin.php';

header('Content-Type: application/json');

session_start();
require_admin($conn);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid method']);
    ob_end_flush();
    exit;
}

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$desc = isset($_POST['description']) ? trim($_POST['description']) : '';
$price = isset($_POST['price']) ? (int)$_POST['price'] : 0;
$image = isset($_POST['image_url']) ? trim($_POST['image_url']) : '';
$rarity = isset($_POST['rarity']) ? trim($_POST['rarity']) : '';

if ($id <= 0 || empty($name) || empty($desc) || $price <= 0) {
    echo json_encode(['success' => false, 'error' => 'Missing or invalid fields']);
    ob_end_flush();
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE items SET item_name=?, item_description=?, price=?, image_url=?, rarity=? WHERE item_id=?");
    $stmt->bind_param("ssissi", $name, $desc, $price, $image, $rarity, $id);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0 || $stmt->errno == 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Update failed or no changes made']);
    }
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
ob_end_flush();
?>
