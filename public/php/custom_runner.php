<?php
/**
 * Custom PHP Runner for Express-PHP integration
 * Populates global variables that are missing in CLI mode.
 */

// 1. Populate $_GET from QUERY_STRING
if (isset($_SERVER['QUERY_STRING'])) {
    parse_str($_SERVER['QUERY_STRING'], $_GET);
}

// 2. Populate $_POST from STDIN
if (($_SERVER['REQUEST_METHOD'] === 'POST') && ($_SERVER['CONTENT_LENGTH'] > 0)) {
    // Read the POST body from standard input
    $post_data = fread(STDIN, (int)$_SERVER['CONTENT_LENGTH']);
    parse_str($post_data, $_POST);
}

// 3. Populate $_COOKIE from HTTP_COOKIE
if (isset($_SERVER['HTTP_COOKIE'])) {
    // Cookies are separated by '; '
    $cookie_pairs = explode('; ', $_SERVER['HTTP_COOKIE']);
    foreach ($cookie_pairs as $pair) {
        $parts = explode('=', $pair, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = urldecode($parts[1]);
            $_COOKIE[$key] = $value;
            
            // If it's the session ID, set it explicitly for session_start()
            if ($key === 'PHPSESSID') {
                session_id($value);
            }
        }
    }
}

// 4. Set some common server variables for consistency
$_SERVER['DOCUMENT_ROOT'] = realpath(__DIR__ . '/../');

// 5. Change to the target script's directory and execute it
if (isset($argv[1]) && isset($argv[2])) {
    chdir($argv[1]);
    require_once $argv[2];
}
?>
