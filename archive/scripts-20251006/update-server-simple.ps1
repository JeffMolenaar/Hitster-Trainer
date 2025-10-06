# Hitster Trainer - Simple Server Update Script
param(
    [string]$ServerIP = "192.168.2.191",
    [string]$ServerUser = "jeffrey"
)

Write-Host "`n🚀 Hitster Trainer - Server Update" -ForegroundColor Green
Write-Host "====================================`n" -ForegroundColor Green

# Check directory
if (-not (Test-Path "Project")) {
    Write-Host "❌ Error: Run from Hitster-Trainer root directory!`n" -ForegroundColor Red
    exit 1
}

# Files to upload
$files = @("index.html", "callback.html", "app.js", "quiz.js", "spotify-auth.js", "hitster-songs.js", "style.css")

Write-Host "📦 Files to upload:" -ForegroundColor Cyan
foreach ($f in $files) {
    if (Test-Path "Project\$f") { Write-Host "  ✓ $f" -ForegroundColor Green }
    else { Write-Host "  ✗ $f (MISSING)" -ForegroundColor Red }
}

Write-Host "`n📤 Uploading to server..." -ForegroundColor Cyan
foreach ($f in $files) {
    if (Test-Path "Project\$f") {
        Write-Host "  $f..." -NoNewline
        scp "Project\$f" "${ServerUser}@${ServerIP}:/home/jeffrey/" 2>$null
        if ($?) { Write-Host " ✓" -ForegroundColor Green }
        else { Write-Host " ✗" -ForegroundColor Red }
    }
}

Write-Host "`n🔧 Installing on server..." -ForegroundColor Cyan
ssh "${ServerUser}@${ServerIP}" "sudo cp /home/jeffrey/*.html /home/jeffrey/*.js /home/jeffrey/*.css /var/www/hitster-trainer/ 2>/dev/null; sudo chown -R www-data:www-data /var/www/hitster-trainer/; sudo chmod -R 755 /var/www/hitster-trainer/; sudo systemctl reload nginx"

Write-Host "✅ Done! App is live at: https://hitster.millercodings.nl`n" -ForegroundColor Green
