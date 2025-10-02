# 🚀 Server Update Guide

## Automatisch updaten met PowerShell script

Het `update-server.ps1` script maakt het updaten van je server super makkelijk!

### Gebruik

```powershell
.\update-server.ps1
```

Of met custom commit message:

```powershell
.\update-server.ps1 -Message "Feature: Added new game mode"
```

### Wat doet het script?

1. **✅ Controleert** of alle bestanden aanwezig zijn
2. **📤 Upload** alle gewijzigde bestanden naar de server via SCP
3. **📁 Verplaatst** bestanden naar `/var/www/hitster-trainer/`
4. **🔐 Fix** alle permissions automatisch
5. **🔄 Reload** Nginx
6. **💾 Git commit & push** (optioneel)

### Vereisten

- **OpenSSH** client geïnstalleerd (Windows 10/11 heeft dit standaard)
- **SSH toegang** tot je server (192.168.2.191)
- **Sudo rechten** voor jeffrey user op de server

### Configuratie aanpassen

Je kunt de server instellingen aanpassen:

```powershell
.\update-server.ps1 -ServerIP "192.168.2.191" -ServerUser "jeffrey"
```

## Handmatig updaten

Als je het script niet wilt gebruiken, volg dan deze stappen:

### 1. Upload bestanden

```powershell
cd Project
scp index.html callback.html app.js quiz.js spotify-auth.js hitster-songs.js style.css jeffrey@192.168.2.191:/home/jeffrey/
```

### 2. Installeer op server

SSH naar je server:

```bash
ssh jeffrey@192.168.2.191
```

Voer uit:

```bash
# Verplaats bestanden
sudo cp /home/jeffrey/*.html /var/www/hitster-trainer/
sudo cp /home/jeffrey/*.js /var/www/hitster-trainer/
sudo cp /home/jeffrey/*.css /var/www/hitster-trainer/

# Fix permissions
sudo chown -R www-data:www-data /var/www/hitster-trainer/
sudo chmod -R 755 /var/www/hitster-trainer/
sudo find /var/www/hitster-trainer/ -type f -exec chmod 644 {} \;

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Commit naar Git

```powershell
git add Project/*
git commit -m "Update Hitster Trainer"
git push origin main
```

## Troubleshooting

### SSH verbinding mislukt

```powershell
# Test SSH verbinding
ssh jeffrey@192.168.2.191 "echo 'Connection OK'"
```

### SCP werkt niet

Zorg dat OpenSSH client geïnstalleerd is:

```powershell
# Check of scp beschikbaar is
Get-Command scp

# Installeer OpenSSH client (als admin)
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

### Permissions fouten op server

```bash
# Check huidige permissions
ls -la /var/www/hitster-trainer/

# Reset alle permissions
sudo chown -R www-data:www-data /var/www/hitster-trainer/
sudo chmod -R 755 /var/www/hitster-trainer/
```

### Nginx errors

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/hitster-trainer_error.log

# Test Nginx configuratie
sudo nginx -t

# Herstart Nginx (als reload niet werkt)
sudo systemctl restart nginx
```

## Tips

### Snelle update zonder prompts

Maak een alias in je PowerShell profile:

```powershell
# Open profile
notepad $PROFILE

# Voeg toe:
function Update-Hitster {
    Set-Location "C:\Users\jmole\OneDrive\Bureaublad\Hitster trainer\Hitster-Trainer"
    .\update-server.ps1
}

# Gebruik:
Update-Hitster
```

### Automatische sync met FileWatcher

Voor ontwikkeling kun je een file watcher opzetten die automatisch upload bij wijzigingen.

### Backup maken

Voor elke grote update:

```powershell
# Lokale backup
$date = Get-Date -Format "yyyyMMdd"
Copy-Item Project -Destination "Backup-$date" -Recurse

# Server backup via SSH
ssh jeffrey@192.168.2.191 "sudo tar -czf /tmp/hitster-backup-$date.tar.gz /var/www/hitster-trainer/"
```

## Live URL

Na een succesvolle update is je app live op:

**🌐 https://hitster.millercodings.nl**

## Support

Bij problemen, check:

1. **Server logs**: `sudo tail -f /var/log/nginx/hitster-trainer_error.log`
2. **Browser console**: F12 → Console tab
3. **Network tab**: Check of alle bestanden laden (F12 → Network)

Happy coding! 🎵
