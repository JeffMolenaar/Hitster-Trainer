# Hitster Trainer - Server Update Script
param(
    [string]$ServerIP = "192.168.2.191",
    [string]$ServerUser = "jeffrey"
)

Write-Host ""
Write-Host "Hitster Trainer - Server Update" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check directory
if (-not (Test-Path "Project")) {
    Write-Host "ERROR: Run from Hitster-Trainer root directory!" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Files to upload
$files = @("index.html", "callback.html", "app.js", "quiz.js", "spotify-auth.js", "hitster-songs.js", "style.css")

Write-Host "Files to upload:" -ForegroundColor Cyan
foreach ($f in $files) {
    if (Test-Path "Project\$f") { 
        Write-Host "  [OK] $f" -ForegroundColor Green 
    }
    else { 
        Write-Host "  [MISSING] $f" -ForegroundColor Red 
    }
}

Write-Host ""
Write-Host "Uploading to server..." -ForegroundColor Cyan
foreach ($f in $files) {
    if (Test-Path "Project\$f") {
        Write-Host "  Uploading $f..." -NoNewline
        scp "Project\$f" "${ServerUser}@${ServerIP}:/home/jeffrey/" 2>$null
        if ($LASTEXITCODE -eq 0) { 
            Write-Host " OK" -ForegroundColor Green 
        }
        else { 
            Write-Host " FAILED" -ForegroundColor Red 
        }
    }
}

Write-Host ""
Write-Host "Installing on server..." -ForegroundColor Cyan
$cmd = "sudo cp /home/jeffrey/*.html /home/jeffrey/*.js /home/jeffrey/*.css /var/www/hitster-trainer/ 2>/dev/null; sudo chown -R www-data:www-data /var/www/hitster-trainer/; sudo chmod -R 755 /var/www/hitster-trainer/; sudo systemctl reload nginx; echo 'Server update complete'"

ssh "${ServerUser}@${ServerIP}" $cmd

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! App is live at: https://hitster.millercodings.nl" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "ERROR: Server setup failed!" -ForegroundColor Red
    Write-Host ""
    exit 1
}
