<?php
/**
 * Debug Logger for Spotify ID Lookup Tool
 * Logs all API responses to /home/jeffrey/spotify-lookup-debug.log
 */

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Log file location
$logFile = '/home/jeffrey/spotify-lookup-debug.log';

// Create log entry
$timestamp = date('Y-m-d H:i:s');
$logType = $data['type'] ?? 'UNKNOWN';
$message = $data['message'] ?? '';
$details = $data['details'] ?? null;

// Format log entry
$logEntry = "[$timestamp] [$logType] $message\n";

if ($details) {
    $logEntry .= "Details: " . json_encode($details, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
}

$logEntry .= str_repeat('-', 80) . "\n";

// Write to log file
$result = file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

if ($result === false) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to write to log file'
    ]);
    exit;
}

// Success
echo json_encode([
    'success' => true,
    'logFile' => $logFile,
    'bytesWritten' => $result,
    'timestamp' => $timestamp
]);
?>
