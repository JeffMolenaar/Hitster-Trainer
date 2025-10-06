# Hitster Trainer - Deployment Instructies

## Deployment naar Ubuntu Server

### Vereisten
- Ubuntu Server (18.04 of nieuwer)
- Root/sudo toegang
- Reverse proxy server met HTTPS configuratie

### Stap 1: Bestanden uploaden
Upload alle bestanden uit de `Project` map naar je Ubuntu server, bijvoorbeeld naar `/tmp/hitster-trainer/`

```bash
# Voorbeeld met scp
scp -r Project/* user@server-ip:/tmp/hitster-trainer/
```

### Stap 2: Deployment script uitvoeren
Log in op je Ubuntu server en voer het deployment script uit:

```bash
cd /tmp/hitster-trainer/
chmod +x deploy.sh
sudo ./deploy.sh
```

Het script zal automatisch:
- ✅ Nginx installeren
- ✅ App directory aanmaken in `/var/www/hitster-trainer/`
- ✅ Bestanden kopiëren
- ✅ Nginx configureren (poort 3000)
- ✅ Permissions instellen
- ✅ Service starten

### Stap 3: Reverse Proxy configureren
Configureer je reverse proxy server om te forwarden naar:
```
http://[ubuntu-server-ip]:3000
```

Voorbeeld Nginx reverse proxy config:
```nginx
server {
    listen 443 ssl http2;
    server_name jouwdomein.nl;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://[ubuntu-server-ip]:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Stap 4: Spotify Developer Dashboard
1. Ga naar https://developer.spotify.com/dashboard
2. Selecteer je app
3. Ga naar Settings
4. Voeg de Redirect URI toe:
   ```
   https://jouwdomein.nl/callback.html
   ```
5. Klik op Save

### Stap 5: Redirect URI updaten in code
Update `spotify-auth.js` regel 7:
```javascript
this.redirectUri = 'https://jouwdomein.nl/callback.html';
```

### Handige Commando's

**Nginx beheren:**
```bash
# Status checken
sudo systemctl status nginx

# Herstarten
sudo systemctl restart nginx

# Logs bekijken
sudo tail -f /var/log/nginx/hitster-trainer_error.log
sudo tail -f /var/log/nginx/hitster-trainer_access.log
```

**Bestanden updaten:**
```bash
# Upload nieuwe bestanden naar de server
scp -r Project/* user@server-ip:/tmp/hitster-trainer/

# Kopieer naar app directory
sudo cp /tmp/hitster-trainer/*.html /var/www/hitster-trainer/
sudo cp /tmp/hitster-trainer/*.js /var/www/hitster-trainer/
sudo cp /tmp/hitster-trainer/*.css /var/www/hitster-trainer/

# Fix permissions
sudo chown -R www-data:www-data /var/www/hitster-trainer/
```

**Troubleshooting:**
```bash
# Check of Nginx draait
sudo systemctl status nginx

# Test Nginx configuratie
sudo nginx -t

# Check of poort 3000 luistert
sudo netstat -tlnp | grep 3000

# Check firewall
sudo ufw status
```

## Structuur op Server

```
/var/www/hitster-trainer/
├── index.html
├── callback.html
├── demo.html
├── app.js
├── quiz.js
├── spotify-auth.js
├── hitster-songs.js
└── style.css

/etc/nginx/sites-available/
└── hitster-trainer

/var/log/nginx/
├── hitster-trainer_access.log
└── hitster-trainer_error.log
```

## Security Overwegingen

- ✅ App draait als `www-data` user (niet als root)
- ✅ Alleen noodzakelijke poorten open
- ✅ Nginx security headers ingesteld
- ✅ HTTPS via reverse proxy
- ✅ .git directory geblokkeerd

## Support

Bij problemen, check:
1. Nginx error logs: `sudo tail -f /var/log/nginx/hitster-trainer_error.log`
2. Nginx status: `sudo systemctl status nginx`
3. Firewall: `sudo ufw status`
4. Poort beschikbaarheid: `sudo netstat -tlnp | grep 3000`
