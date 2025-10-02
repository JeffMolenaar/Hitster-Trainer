# Nginx Reverse Proxy Setup Instructies

## Quick Start Guide

Er zijn **twee configuratie bestanden**:

1. **`nginx-reverse-proxy-http-only.conf`** - Start hiermee! (voor Certbot SSL certificaten)
2. **`nginx-reverse-proxy.conf`** - Volledig HTTPS setup (optioneel, na Certbot)

### Snelle Setup (Aanbevolen):

```bash
# 1. Upload HTTP-only config
scp nginx-reverse-proxy-http-only.conf user@reverse-proxy:/tmp/

# 2. Installeer
sudo cp /tmp/nginx-reverse-proxy-http-only.conf /etc/nginx/sites-available/hitster-trainer
sudo nano /etc/nginx/sites-available/hitster-trainer  # Vervang your-domain.com

# 3. Activeer
sudo ln -s /etc/nginx/sites-available/hitster-trainer /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4. Verkrijg SSL certificaat
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d jouw-domein.nl -d www.jouw-domein.nl

# Done! Certbot heeft automatisch HTTPS geconfigureerd 🎉
```

---

## Gedetailleerde Installatie

### Stap 1: Configuratie bestanden uploaden

Upload beide configuratie bestanden naar je reverse proxy server:

```bash
# Upload naar server
scp nginx-reverse-proxy-http-only.conf user@reverse-proxy-ip:/tmp/
scp nginx-reverse-proxy.conf user@reverse-proxy-ip:/tmp/

# Of als je al op de server bent, kopieer de inhoud handmatig:
sudo nano /etc/nginx/sites-available/hitster-trainer
```

### Stap 2: Configuratie aanpassen

Open het configuratie bestand en pas de volgende zaken aan:

```bash
sudo nano /etc/nginx/sites-available/hitster-trainer
```

**Verplichte aanpassingen:**

1. **Domeinnaam** (regel 9 en 17):
   ```nginx
   server_name jouw-domein.nl www.jouw-domein.nl;
   ```

2. **SSL Certificaten** (regel 20-21):
   ```nginx
   ssl_certificate /pad/naar/jouw/certificaat.crt;
   ssl_certificate_key /pad/naar/jouw/private.key;
   ```

**Optionele aanpassingen:**

- De backend IP (`192.168.2.191:3000`) is al correct ingesteld
- SSL protocols en ciphers zijn al modern en veilig ingesteld
- Security headers zijn al toegevoegd

### Stap 3: Start met HTTP-only configuratie (voor Certbot)

**BELANGRIJK**: Gebruik eerst de HTTP-only configuratie zodat Certbot kan werken!

```bash
# Kopieer de HTTP-only configuratie
sudo cp /tmp/nginx-reverse-proxy-http-only.conf /etc/nginx/sites-available/hitster-trainer

# OF pas de server_name aan in het bestand
sudo nano /etc/nginx/sites-available/hitster-trainer
# Vervang: your-domain.com met jouw-domein.nl

# Maak symbolic link naar sites-enabled
sudo ln -s /etc/nginx/sites-available/hitster-trainer /etc/nginx/sites-enabled/

# Test de configuratie
sudo nginx -t

# Als test succesvol is, herlaad Nginx
sudo systemctl reload nginx
```

### Stap 4: Firewall instellen

```bash
# Sta HTTP en HTTPS verkeer toe
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Reload firewall
sudo ufw reload
```

### Stap 5: SSL Certificaat verkrijgen met Let's Encrypt

#### Optie A: Let's Encrypt met Certbot (Gratis, Aanbevolen)

```bash
# Installeer Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Verkrijg automatisch een SSL certificaat
# Certbot zal de HTTP-only configuratie automatisch updaten met HTTPS
sudo certbot --nginx -d jouw-domein.nl -d www.jouw-domein.nl

# Volg de prompts:
# - Email adres invoeren
# - Akkoord gaan met Terms of Service
# - Kies optie 2: Redirect HTTP naar HTTPS (aanbevolen)

# Certbot heeft nu automatisch:
# - SSL certificaten geïnstalleerd
# - Nginx configuratie aangepast met HTTPS
# - HTTP naar HTTPS redirect toegevoegd
```

### Stap 6 (Optioneel): Overschakelen naar aangepaste HTTPS configuratie

Als je meer controle wilt over de configuratie (security headers, caching, etc.):

```bash
# Backup de Certbot configuratie
sudo cp /etc/nginx/sites-available/hitster-trainer /etc/nginx/sites-available/hitster-trainer.certbot-backup

# Kopieer de volledige HTTPS configuratie
sudo cp /tmp/nginx-reverse-proxy.conf /etc/nginx/sites-available/hitster-trainer

# Pas aan: vervang your-domain.com met jouw domein
sudo nano /etc/nginx/sites-available/hitster-trainer

# Pas SSL certificaat paden aan (Certbot gebruikt meestal):
# ssl_certificate /etc/letsencrypt/live/jouw-domein.nl/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/jouw-domein.nl/privkey.pem;

# Test en herlaad
sudo nginx -t
sudo systemctl reload nginx
```

#### Optie B: Eigen certificaat

Als je al een SSL certificaat hebt, plaats deze in:
```bash
/etc/ssl/certs/jouw-domein.crt
/etc/ssl/private/jouw-domein.key
```

En zorg ervoor dat de permissions correct zijn:
```bash
sudo chmod 644 /etc/ssl/certs/jouw-domein.crt
sudo chmod 600 /etc/ssl/private/jouw-domein.key
```

## Verificatie

### Test de configuratie

```bash
# Check Nginx status
sudo systemctl status nginx

# Test de configuratie syntax
sudo nginx -t

# Bekijk logs
sudo tail -f /var/log/nginx/hitster-trainer_error.log
```

### Test de connectie

```bash
# Test HTTP redirect
curl -I http://jouw-domein.nl

# Test HTTPS
curl -I https://jouw-domein.nl

# Test backend connectie
curl http://192.168.2.191:3000
```

## Troubleshooting

### Nginx herstart niet

```bash
# Check de error logs
sudo tail -50 /var/log/nginx/error.log

# Test configuratie
sudo nginx -t
```

### 502 Bad Gateway

Dit betekent dat de reverse proxy de backend niet kan bereiken:

```bash
# Check of backend server draait
curl http://192.168.2.191:3000

# Check firewall op Ubuntu server
# Zorg ervoor dat poort 3000 open is voor je reverse proxy IP
sudo ufw allow from [reverse-proxy-ip] to any port 3000
```

### 504 Gateway Timeout

```bash
# Verhoog timeouts in de Nginx config:
proxy_connect_timeout 120s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;
```

### SSL Certificaat fouten

```bash
# Test SSL certificaat
sudo nginx -t

# Check certificaat geldigheid
openssl x509 -in /etc/ssl/certs/jouw-domein.crt -text -noout

# Hernieuw Let's Encrypt certificaat
sudo certbot renew
```

## Automatisch SSL Certificaat Vernieuwing

Als je Let's Encrypt gebruikt, is automatische vernieuwing al ingesteld:

```bash
# Test de vernieuwing
sudo certbot renew --dry-run

# Certbot timer checken
sudo systemctl status certbot.timer
```

## Complete Setup Samenvatting

1. ✅ **Reverse Proxy Server**: Nginx configuratie op je reverse proxy
2. ✅ **Ubuntu Server**: Hitster Trainer app draait op `192.168.2.191:3000`
3. ✅ **SSL**: HTTPS wordt afgehandeld door reverse proxy
4. ✅ **Spotify**: Redirect URI wordt `https://jouw-domein.nl/callback.html`

## Network Flow

```
[Browser]
    ↓ HTTPS (443)
[Reverse Proxy - Nginx]
    ↓ HTTP (3000)
[Ubuntu Server - 192.168.2.191:3000]
    ↓
[Hitster Trainer App]
```

## Security Checklist

- [x] HTTPS alleen (HTTP redirected naar HTTPS)
- [x] Moderne TLS versies (1.2, 1.3)
- [x] Veilige ciphers
- [x] Security headers (HSTS, X-Frame-Options, etc.)
- [x] CORS headers voor Spotify API
- [x] SSL certificaat geldig
- [x] Firewall regels correct
- [x] Logging ingeschakeld

## Na Deployment

Update de redirect URI in je code:

**In `Project/spotify-auth.js` (regel 7):**
```javascript
this.redirectUri = 'https://jouw-domein.nl/callback.html';
```

**In Spotify Developer Dashboard:**
Voeg toe: `https://jouw-domein.nl/callback.html`

Dan zou alles moeten werken! 🎉
