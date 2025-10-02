# Hitster Trainer - Server Update Script
# This script uploads all project files to the Ubuntu server and sets up permissions

param(
    [string]$ServerIP = "192.168.2.191",
    [string]$ServerUser = "jeffrey",
    [string]$Message = "Update Hitster Trainer files"
)

Write-Host "🚀 Hitster Trainer - Server Update Script" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "Project")) {
    Write-Host "❌ Error: Project directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the Hitster-Trainer root directory." -ForegroundColor Yellow
    exit 1
}

# Define files to upload
$filesToUpload = @(
    "Project/index.html",
    "Project/callback.html",
    "Project/app.js",
    "Project/quiz.js",
    "Project/spotify-auth.js",
    "Project/hitster-songs.js",
    "Project/style.css"
)

Write-Host "📦 Files to upload:" -ForegroundColor Cyan
foreach ($file in $filesToUpload) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (NOT FOUND)" -ForegroundColor Red
    }
}
Write-Host ""

# Ask for confirmation
$confirmation = Read-Host "Do you want to proceed with the upload? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "❌ Upload cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📤 Uploading files to server..." -ForegroundColor Cyan

# Upload each file
$uploadSuccess = $true
foreach ($file in $filesToUpload) {
    if (Test-Path $file) {
        Write-Host "  Uploading $file..." -NoNewline
        
        try {
            scp $file "${ServerUser}@${ServerIP}:/home/jeffrey/"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host " ✓" -ForegroundColor Green
            } else {
                Write-Host " ✗ Failed" -ForegroundColor Red
                $uploadSuccess = $false
            }
        } catch {
            Write-Host " ✗ Error: $_" -ForegroundColor Red
            $uploadSuccess = $false
        }
    }
}

if (-not $uploadSuccess) {
    Write-Host ""
    Write-Host "❌ Some files failed to upload. Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Setting up files on server..." -ForegroundColor Cyan

# Create the server commands
$serverCommands = @"
echo '📁 Moving files to web directory...'
sudo cp /home/jeffrey/index.html /var/www/hitster-trainer/ 2>/dev/null || echo 'index.html not found'
sudo cp /home/jeffrey/callback.html /var/www/hitster-trainer/ 2>/dev/null || echo 'callback.html not found'
sudo cp /home/jeffrey/app.js /var/www/hitster-trainer/ 2>/dev/null || echo 'app.js not found'
sudo cp /home/jeffrey/quiz.js /var/www/hitster-trainer/ 2>/dev/null || echo 'quiz.js not found'
sudo cp /home/jeffrey/spotify-auth.js /var/www/hitster-trainer/ 2>/dev/null || echo 'spotify-auth.js not found'
sudo cp /home/jeffrey/hitster-songs.js /var/www/hitster-trainer/ 2>/dev/null || echo 'hitster-songs.js not found'
sudo cp /home/jeffrey/style.css /var/www/hitster-trainer/ 2>/dev/null || echo 'style.css not found'

echo ''
echo '🔐 Fixing permissions...'
sudo chown -R www-data:www-data /var/www/hitster-trainer/
sudo chmod -R 755 /var/www/hitster-trainer/
sudo find /var/www/hitster-trainer/ -type f -exec chmod 644 {} \;

echo ''
echo '🔄 Reloading Nginx...'
sudo systemctl reload nginx

echo ''
echo '✅ Server update complete!'
echo ''
echo '📊 File listing:'
ls -lh /var/www/hitster-trainer/ | grep -E '\.(html|js|css)$'
"@

# Execute commands on server
Write-Host "  Executing commands on server..." -ForegroundColor Yellow
ssh "${ServerUser}@${ServerIP}" $serverCommands

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Server setup failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Server update completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your app is live at: https://hitster.millercodings.nl" -ForegroundColor Cyan
Write-Host ""

# Git operations
Write-Host "📝 Git operations:" -ForegroundColor Cyan
$gitConfirmation = Read-Host "Do you want to commit and push changes to Git? (y/n)"

if ($gitConfirmation -eq 'y') {
    Write-Host "  Adding files to git..." -NoNewline
    git add Project/*.html Project/*.js Project/*.css
    Write-Host " ✓" -ForegroundColor Green
    
    Write-Host "  Committing changes..." -NoNewline
    git commit -m $Message
    Write-Host " ✓" -ForegroundColor Green
    
    Write-Host "  Pushing to remote..." -NoNewline
    git push origin main
    Write-Host " ✓" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "✅ Git operations completed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 All done! Have fun with your Hitster Trainer!" -ForegroundColor Green
Write-Host ""
