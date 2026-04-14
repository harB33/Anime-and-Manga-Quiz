<?php 
$item_prices = [
    'card1' => 350,
    'card2' => 500,
    'card3' => 150
]; // example lang

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['submit'])) {
        $first_name = $_POST['first_name'];
        $last_name = $_POST['last_name'];
        $email = $_POST['email'];

        $selected_items = $_POST['items'] ?? [];
        if (!is_array($selected_items)) {
            $selected_items = [$selected_items];
        }

        $total_amount = 0;
        foreach ($selected_items as $item) {
            $total_amount += $item_prices[$item] ?? 0;
        }

        if (!empty($first_name) && !empty($last_name) && !empty($email) && !empty($selected_items)) {
            echo "<h1>Order Summary</h1>";
            echo "<p>Name: " . htmlspecialchars($first_name) . " " . htmlspecialchars($last_name) . "</p>";
            echo "<p>Email: " . htmlspecialchars($email) . "</p>";
            echo "<p>Items bought: " . count($selected_items) . "</p>";
            echo "<p>Selected Items: " . htmlspecialchars(implode(', ', $selected_items)) . "</p>";
            echo "<p>Total Price: " . htmlspecialchars($total_amount) . " Php </p>";
        } else {
            echo "<p>No data submitted.</p>";
        }
    }
}       

?>