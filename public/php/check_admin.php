<?php
function require_admin($conn) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        ob_end_flush();
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT role FROM players WHERE player_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $is_admin = false;
    if ($row = $result->fetch_assoc()) {
        if ($row['role'] === 'admin') {
            $is_admin = true;
        }
    }
    $stmt->close();

    if (!$is_admin) {
        echo json_encode(['success' => false, 'error' => 'Unauthorized: Admin access required']);
        ob_end_flush();
        exit;
    }
}
?>
