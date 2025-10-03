<?php
// Deezer API Proxy
// Omzeilt CORS issues door server-side request te doen

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get query parameter
$query = isset($_GET['q']) ? $_GET['q'] : '';

if (empty($query)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing query parameter']);
    exit;
}

// Build Deezer API URL
$deezerUrl = 'https://api.deezer.com/search?q=' . urlencode($query);

// Make request to Deezer API
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'User-Agent: Mozilla/5.0 (compatible; Hitster-Trainer/1.0)',
        'timeout' => 10
    ]
]);

$response = @file_get_contents($deezerUrl, false, $context);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to fetch from Deezer API']);
    exit;
}

// Return Deezer response
http_response_code(200);
echo $response;
?>
