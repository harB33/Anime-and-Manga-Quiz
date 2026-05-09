<?php
require_once __DIR__ . '/public/db/db.php';
$stmt = $conn->query("SELECT * FROM players WHERE player_name = 'test_insert_id'");
print_r($stmt->fetch_assoc());
?>
