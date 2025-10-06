# Debug Log Viewer Helper Script
# Voor Hitster Trainer - Spotify ID Lookup Debug Logging

Write-Host "🔍 Hitster Trainer - Debug Log Viewer" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

$server = "192.168.2.191"
$user = "jeffrey"
$logFile = "/var/log/hitster-trainer/spotify-lookup-debug.log"

Write-Host "Debug log locatie: $logFile`n" -ForegroundColor Yellow

Write-Host "Beschikbare commandos:" -ForegroundColor Green
Write-Host "1. Live log bekijken (tail -f)"
Write-Host "2. Laatste 50 regels"
Write-Host "3. Zoek naar specifiek nummer"
Write-Host "4. Toon preview URL statistieken"
Write-Host "5. Log leegmaken"
Write-Host "6. Log downloaden naar lokaal`n"

$choice = Read-Host "Kies een optie (1-6)"

switch ($choice) {
    "1" {
        Write-Host "`n📊 Live log monitoring (Ctrl+C om te stoppen)...`n" -ForegroundColor Yellow
        ssh -t "${user}@${server}" "tail -f ${logFile}"
    }
    "2" {
        Write-Host "`n📄 Laatste 50 regels:`n" -ForegroundColor Yellow
        ssh -t "${user}@${server}" "tail -50 ${logFile}"
    }
    "3" {
        $searchTerm = Read-Host "`nZoek naar (bijv. artist of title)"
        Write-Host "`n🔍 Zoekresultaten voor ``$searchTerm``:`n" -ForegroundColor Yellow
        ssh -t "${user}@${server}" "grep -i ${searchTerm} ${logFile} | tail -20"
    }
    "4" {
        Write-Host "`n📊 Preview URL statistieken:`n" -ForegroundColor Yellow
        ssh -t "${user}@${server}" "grep MATCH_FOUND ${logFile} | wc -l && grep hasPreview.*true ${logFile} | wc -l && grep hasPreview.*false ${logFile} | wc -l"
    }
    "5" {
        $confirm = Read-Host "`n⚠️  Weet je zeker dat je de log wilt legen? (ja/nee)"
        if ($confirm -eq "ja") {
            ssh -t "${user}@${server}" "echo > ${logFile}"
            Write-Host "`n✅ Log is geleegd!" -ForegroundColor Green
        }
        else {
            Write-Host "`n❌ Geannuleerd" -ForegroundColor Red
        }
    }
    "6" {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $localPath = ".\spotify-lookup-debug-$timestamp.log"
        Write-Host "`n⬇️  Downloaden naar: $localPath`n" -ForegroundColor Yellow
        scp "${user}@${server}:${logFile}" $localPath
        Write-Host "`n✅ Download compleet!" -ForegroundColor Green
    }
    default {
        Write-Host "`n❌ Ongeldige keuze!" -ForegroundColor Red
    }
}

Write-Host "`n"
