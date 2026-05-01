<?php
$host = "localhost";
$user = "jomariharvy";
$pass = "Crustkosivillanueva";
$db = "shitsumon";

try {
    $conn = new mysqli($host, $user, $pass, $db);
} catch (Exception $e) {
    try {
        $conn = new mysqli($host, "root", "", $db);
    } catch (Exception $err) {
        die("Connection failed: " . $err->getMessage());
    }
}

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>