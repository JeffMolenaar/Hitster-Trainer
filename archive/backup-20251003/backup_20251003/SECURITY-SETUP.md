# 🔐 Spotify ID Lookup - Security Setup

## ⚠️ BELANGRIJK: Wijzig de Secret Key!

Voor de beveiliging van het auto-save systeem moet je de secret key aanpassen.

### Stap 1: Wijzig Secret Key in PHP

Open `update-songs.php` en wijzig regel 23:

```php
$SECRET_KEY = 'hitster-admin-2024'; // Change this!
```

Wijzig dit naar iets unieks, bijvoorbeeld:
```php
$SECRET_KEY = 'jouw-super-geheime-sleutel-hier-123456';
```

### Stap 2: Wijzig Secret Key in JavaScript

Open `spotify-id-lookup.js` en zoek naar regel ~417:

```javascript
const SECRET_KEY = 'hitster-admin-2024';
```

Wijzig dit naar EXACT DEZELFDE waarde als in de PHP:
```javascript
const SECRET_KEY = 'jouw-super-geheime-sleutel-hier-123456';
```

⚠️ **LET OP:** Beide keys moeten EXACT hetzelfde zijn!

### Stap 3: Deploy naar Server

```bash
# Upload de aangepaste bestanden
scp Project/update-songs.php jeffrey@192.168.2.191:/tmp/
scp Project/spotify-id-lookup.js jeffrey@192.168.2.191:/tmp/

# Deploy op server
ssh -t jeffrey@192.168.2.191 'sudo cp /tmp/update-songs.php /tmp/spotify-id-lookup.js /var/www/hitster-trainer/ && sudo chown www-data:www-data /var/www/hitster-trainer/update-songs.php /var/www/hitster-trainer/spotify-id-lookup.js && sudo chmod 644 /var/www/hitster-trainer/*.php /var/www/hitster-trainer/*.js'
```

## 🛡️ Extra Beveiliging (Optioneel)

### .htaccess beveiliging

Voeg toe aan `/var/www/hitster-trainer/.htaccess`:

```apache
# Blokkeer directe toegang tot update-songs.php vanaf buitenaf
<Files "update-songs.php">
    Order Deny,Allow
    Deny from all
    Allow from 127.0.0.1
    Allow from ::1
    # Voeg je eigen IP toe
    Allow from 192.168.2.0/24
</Files>
```

### IP Whitelist in PHP

Voeg toe aan `update-songs.php` na regel 10:

```php
// IP Whitelist (optioneel)
$allowed_ips = ['127.0.0.1', '::1', '192.168.2.191']; // Voeg je IPs toe
$client_ip = $_SERVER['REMOTE_ADDR'];

if (!in_array($client_ip, $allowed_ips)) {
    http_response_code(403);
    die(json_encode(['error' => 'Access denied from ' . $client_ip]));
}
```

## 📦 Backups

Het systeem maakt automatisch backups in:
```
/var/www/hitster-trainer/backups/
```

Elke keer dat je "Save & Deploy" klikt wordt een backup gemaakt:
```
hitster-songs-2024-10-02-143025.js
```

### Backup terugzetten

Als je een oude versie wilt terugzetten:

```bash
ssh jeffrey@192.168.2.191
cd /var/www/hitster-trainer
sudo cp backups/hitster-songs-2024-10-02-143025.js hitster-songs.js
sudo systemctl reload nginx
```

## 🚀 Hoe werkt Auto-Save?

1. **Klik "💾 Save & Deploy to Server"**
   - Vraagt om bevestiging
   - Maakt backup van huidige bestand
   - Upload naar server via PHP endpoint
   - Server overschrijft `hitster-songs.js`
   - Pagina herlaadt automatisch

2. **Backup knoppen**
   - "⬇️ Download JSON (Backup)" - Download als JSON
   - "⬇️ Download JS (Backup)" - Download als JavaScript bestand

3. **Security**
   - Secret key verificatie (PHP + JS match required)
   - Optioneel: IP whitelist
   - Optioneel: .htaccess bescherming
   - Automatische backups

## 🔍 Troubleshooting

### "Unauthorized" error
- Check of de SECRET_KEY in beide bestanden exact hetzelfde is
- Let op hoofdletters/kleine letters

### "Failed to write file" error
- Check permissions op de server:
  ```bash
  sudo chown www-data:www-data /var/www/hitster-trainer/hitster-songs.js
  sudo chmod 644 /var/www/hitster-trainer/hitster-songs.js
  ```

### "PHP not found" error
- Check of PHP geïnstalleerd is:
  ```bash
  ssh jeffrey@192.168.2.191 "php --version"
  ```
- Installeer PHP als nodig:
  ```bash
  sudo apt install php php-fpm
  ```

### Backups niet aangemaakt
- Check/maak backup directory:
  ```bash
  ssh jeffrey@192.168.2.191
  sudo mkdir -p /var/www/hitster-trainer/backups
  sudo chown www-data:www-data /var/www/hitster-trainer/backups
  sudo chmod 755 /var/www/hitster-trainer/backups
  ```

## ✅ Success Checklist

Na setup:
- [ ] SECRET_KEY aangepast in beide bestanden
- [ ] update-songs.php geüpload naar server
- [ ] spotify-id-lookup.js geüpload naar server
- [ ] Permissions correct (644 voor .php en .js)
- [ ] Backup directory bestaat en schrijfbaar
- [ ] Test: klik "Save & Deploy" met voorbeeld data
- [ ] Verificatie: check of hitster-songs.js is bijgewerkt
- [ ] Verificatie: check of backup is aangemaakt

Klaar! 🎉
