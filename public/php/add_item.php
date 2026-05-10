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

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$desc = isset($_POST['description']) ? trim($_POST['description']) : '';
$price = isset($_POST['price']) ? (int)$_POST['price'] : 0;
$image = isset($_POST['image_url']) ? trim($_POST['image_url']) : '/images/anime_merch_figure.png';
$rarity = isset($_POST['rarity']) ? trim($_POST['rarity']) : 'Common';

if (empty($name) || empty($desc) || $price <= 0) {
    echo json_encode(['success' => false, 'error' => 'Missing or invalid fields']);
    ob_end_flush();
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO items (item_name, item_description, price, image_url, rarity) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssiss", $name, $desc, $price, $image, $rarity);
    $stmt->execute();
    
    $insert_id = $stmt->insert_id;
    $stmt->close();
    
    echo json_encode(['success' => true, 'item_id' => $insert_id]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
ob_end_flush();
?>
