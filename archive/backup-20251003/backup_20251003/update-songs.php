<?php
/**
 * Hitster Songs Update Endpoint
 * Allows updating hitster-songs.js file via POST request
 */

// Security: Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

// Security: Check if request has valid content
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['songs']) || !isset($data['secret'])) {
    http_response_code(400);
    die(json_encode(['error' => 'Invalid request']));
}

// Security: Simple secret key check (change this to something secure!)
// You can also use Spotify access token verification here
$SECRET_KEY = 'hitster-admin-2024'; // Change this!

if ($data['secret'] !== $SECRET_KEY) {
    http_response_code(403);
    die(json_encode(['error' => 'Unauthorized']));
}

// Validate songs array
if (!is_array($data['songs'])) {
    http_response_code(400);
    die(json_encode(['error' => 'Songs must be an array']));
}

// Create backup of current file
$targetFile = __DIR__ . '/hitster-songs.js';
$backupDir = __DIR__ . '/backups';

if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

if (file_exists($targetFile)) {
    $backupFile = $backupDir . '/hitster-songs-' . date('Y-m-d-His') . '.js';
    copy($targetFile, $backupFile);
}

// Generate new hitster-songs.js content
$jsContent = "// Hitster Songs Database\n";
$jsContent .= "// Last updated: " . date('Y-m-d H:i:s') . "\n";
$jsContent .= "const hitsterSongs = " . json_encode($data['songs'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";\n";

// Write to file
$result = file_put_contents($targetFile, $jsContent);

if ($result === false) {
    http_response_code(500);
    die(json_encode(['error' => 'Failed to write file']));
}

// Success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'hitster-songs.js updated successfully',
    'songCount' => count($data['songs']),
    'backup' => basename($backupFile ?? 'none'),
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
