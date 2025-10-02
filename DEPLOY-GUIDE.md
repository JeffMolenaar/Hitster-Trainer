# 🚀 Server-Side Deployment

Dit is de **makkelijkste manier** om je Hitster Trainer app te updaten!

## 📋 Setup (Eenmalig)

### 1. Upload het update script naar je server

```powershell
# Vanaf je Windows machine
scp Project\update-from-git.sh jeffrey@192.168.2.191:/home/jeffrey/
```

### 2. Maak het executable

```bash
# Op de server
ssh jeffrey@192.168.2.191
chmod +x /home/jeffrey/update-from-git.sh
```

## 🎯 Gebruik

**Elke keer als je iets hebt gewijzigd:**

### Stap 1: Commit & push naar GitHub (op Windows)

```powershell
cd "C:\Users\jmole\OneDrive\Bureaublad\Hitster trainer\Hitster-Trainer"

git add Project\*.html Project\*.js Project\*.css
git commit -m "Your update message"
git push origin main
```

### Stap 2: Update op server (1 simpel commando!)

```bash
# SSH naar server en run update script
ssh jeffrey@192.168.2.191 "/home/jeffrey/update-from-git.sh"
```

**Of nog sneller in 1 regel vanaf Windows:**

```powershell
ssh jeffrey@192.168.2.191 "/home/jeffrey/update-from-git.sh"
```

## ✨ Wat doet het script?

1. 📥 **Clone** laatste versie van GitHub
2. 📁 **Kopieert** alle bestanden naar `/var/www/hitster-trainer/`
3. 🔐 **Fix** alle permissions automatisch
4. 🔄 **Reload** Nginx
5. 🧹 **Cleanup** tijdelijke bestanden
6. ✅ **Toont** overzicht van gedeployde bestanden

## 🎨 Output voorbeeld

```
🚀 Hitster Trainer - Update from GitHub
========================================

📥 Cloning repository...
✓ Repository cloned

📋 Files to deploy:
  ✓ index.html
  ✓ callback.html
  ✓ app.js
  ✓ quiz.js
  ✓ spotify-auth.js
  ✓ hitster-songs.js
  ✓ style.css

📁 Copying files to web directory...
  ✓ HTML files
  ✓ JavaScript files
  ✓ CSS files

🔐 Fixing permissions...
  ✓ Permissions fixed

🔄 Reloading Nginx...
  ✓ Nginx reloaded

🧹 Cleaning up...
  ✓ Temporary files removed

✅ Update complete!

🌐 App is live at: https://hitster.millercodings.nl
```

## 💡 Pro Tips

### PowerShell Alias (optioneel)

Maak een alias voor super snelle updates:

```powershell
# Open je PowerShell profile
notepad $PROFILE

# Voeg toe:
function Deploy-Hitster {
    param([string]$Message = "Update")
    
    Set-Location "C:\Users\jmole\OneDrive\Bureaublad\Hitster trainer\Hitster-Trainer"
    
    Write-Host "`nCommitting changes..." -ForegroundColor Cyan
    git add Project\*.html Project\*.js Project\*.css
    git commit -m $Message
    git push origin main
    
    Write-Host "`nDeploying to server..." -ForegroundColor Cyan
    ssh jeffrey@192.168.2.191 "/home/jeffrey/update-from-git.sh"
}

# Gebruik dan:
Deploy-Hitster "Added new feature"
```

### Complete Workflow met Alias

```powershell
# Maak wijzigingen in je code...

# Deploy in 1 commando:
Deploy-Hitster "Fixed quiz bug"
```

### SSH zonder wachtwoord

Om het nóg makkelijker te maken:

```powershell
# Genereer SSH key (eenmalig)
ssh-keygen -t ed25519

# Kopieer naar server
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh jeffrey@192.168.2.191 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

Nu werkt alles zonder wachtwoorden!

## 🔍 Troubleshooting

### Script draait niet

```bash
# Check permissions
ls -la /home/jeffrey/update-from-git.sh

# Moet executable zijn: -rwxr-xr-x
chmod +x /home/jeffrey/update-from-git.sh
```

### Git clone faalt

```bash
# Test git op server
ssh jeffrey@192.168.2.191 "git --version"

# Installeer git als nodig
ssh jeffrey@192.168.2.191 "sudo apt install git -y"
```

### Permissions errors

```bash
# Check of jeffrey sudo rechten heeft
ssh jeffrey@192.168.2.191 "sudo -l"
```

### Nginx reload faalt

```bash
# Check Nginx status
ssh jeffrey@192.168.2.191 "sudo systemctl status nginx"

# Check Nginx config
ssh jeffrey@192.168.2.191 "sudo nginx -t"
```

## 📊 Vergelijking: Deployment Methodes

| Methode | Voor- & Nadelen |
|---------|-----------------|
| **`update-from-git.sh` (DIT)** | ✅ Geen wachtwoorden tijdens upload<br>✅ Altijd sync met GitHub<br>✅ 1 simpel commando<br>✅ Automatische cleanup |
| `deploy.ps1` (Windows) | ⚠️ Veel wachtwoord prompts<br>⚠️ Handmatig uploaden<br>✅ Direct vanuit Windows |
| Handmatig SCP | ❌ Veel stappen<br>❌ Foutgevoelig<br>❌ Geen automation |

## 🎯 Aanbevolen Workflow

```
┌─────────────────┐
│  Code wijzigen  │
│   in VS Code    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Git commit &   │
│      push       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Run update.sh   │
│   op server     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   🎉 LIVE! 🎉   │
└─────────────────┘
```

## 🌐 Live URL

**https://hitster.millercodings.nl**

---

**Happy deploying! 🚀**
