<?php

// 1. Populate $_GET from QUERY_STRING
if (isset($_SERVER['QUERY_STRING'])) {
    parse_str($_SERVER['QUERY_STRING'], $_GET);
}

// 2. Populate $_POST from STDIN
if (($_SERVER['REQUEST_METHOD'] === 'POST') && isset($_SERVER['CONTENT_LENGTH']) && ($_SERVER['CONTENT_LENGTH'] > 0)) {
    // Read the POST body from standard input and preserve it for JSON requests
    $post_data = fread(STDIN, (int)$_SERVER['CONTENT_LENGTH']);
    $_SERVER['RAW_POST_DATA'] = $post_data;

    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($contentType, 'application/json')) {
        $decoded = json_decode($post_data, true);
        if (is_array($decoded)) {
            $_POST = $decoded;
        } else {
            parse_str($post_data, $_POST);
        }
    } else {
        parse_str($post_data, $_POST);
    }
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
