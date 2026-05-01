<?php
header('Content-Type: application/json');

echo json_encode([
    'php' => true,
    'message' => 'PHP is reachable from the Node/Express app'
]);
