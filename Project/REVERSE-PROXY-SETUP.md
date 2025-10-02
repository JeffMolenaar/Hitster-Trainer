# Nginx Reverse Proxy Setup Instructies

## Installatie op je Reverse Proxy Server

### Stap 1: Configuratie bestand plaatsen

Kopieer `nginx-reverse-proxy.conf` naar je reverse proxy server:

```bash
# Upload naar server
scp nginx-reverse-proxy.conf user@reverse-proxy-ip:/tmp/

# Of als je al op de server bent, maak het bestand aan:
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

### Stap 3: Site activeren

```bash
# Maak symbolic link naar sites-enabled
sudo ln -s /etc/nginx/sites-available/hitster-trainer /etc/nginx/sites-enabled/

# Test de configuratie
sudo nginx -t

# Als test succesvol is, herlaad Nginx
sudo systemctl reload nginx
```

### Stap 4: Firewall instellen

```bash
# Sta HTTPS verkeer toe
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp

# Reload firewall
sudo ufw reload
```

### Stap 5: SSL Certificaat verkrijgen (als je die nog niet hebt)

#### Optie A: Let's Encrypt (Gratis, Aanbevolen)

```bash
# Installeer Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Verkrijg automatisch een SSL certificaat
sudo certbot --nginx -d jouw-domein.nl -d www.jouw-domein.nl

# Certbot zal automatisch je Nginx configuratie updaten
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
