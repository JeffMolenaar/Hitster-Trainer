# File Permissions Fix voor Hitster Trainer

## Snelle Fix

Als je net een bestand geüpload hebt en het werkt niet, run dit op je Ubuntu server:

```bash
# Alles in één keer fixen
sudo chown -R www-data:www-data /var/www/hitster-trainer/ && sudo chmod -R 755 /var/www/hitster-trainer/ && sudo systemctl restart nginx
```

## Gedetailleerde Commands

### Stap 1: Ownership naar www-data

Nginx draait als `www-data` user, dus alle bestanden moeten van die user zijn:

```bash
# Verander owner van alle bestanden
sudo chown -R www-data:www-data /var/www/hitster-trainer/
```

### Stap 2: Permissions instellen

```bash
# Directories: 755 (rwxr-xr-x)
# Bestanden: 644 (rw-r--r--)
sudo chmod -R 755 /var/www/hitster-trainer/

# Of specifieker:
sudo find /var/www/hitster-trainer/ -type d -exec chmod 755 {} \;
sudo find /var/www/hitster-trainer/ -type f -exec chmod 644 {} \;
```

### Stap 3: Nginx herstarten

```bash
sudo systemctl restart nginx
```

## Als je net een bestand hebt geüpload

Bijvoorbeeld je hebt net `spotify-auth.js` geüpload naar `/home/jeffrey/`:

```bash
# Verplaats het bestand naar de juiste locatie
sudo cp /home/jeffrey/spotify-auth.js /var/www/hitster-trainer/

# Fix permissions
sudo chown www-data:www-data /var/www/hitster-trainer/spotify-auth.js
sudo chmod 644 /var/www/hitster-trainer/spotify-auth.js

# Herstart Nginx
sudo systemctl restart nginx
```

## Complete Reset (als alles fout zit)

```bash
# Stop Nginx
sudo systemctl stop nginx

# Fix alle permissions
sudo chown -R www-data:www-data /var/www/hitster-trainer/
sudo chmod -R 755 /var/www/hitster-trainer/
sudo find /var/www/hitster-trainer/ -type f -exec chmod 644 {} \;

# Start Nginx
sudo systemctl start nginx

# Check status
sudo systemctl status nginx
```

## Verificatie

Check of de permissions correct zijn:

```bash
# Lijst alle bestanden met permissions
ls -la /var/www/hitster-trainer/

# Gewenste output:
# drwxr-xr-x  2 www-data www-data 4096 ... .
# -rw-r--r--  1 www-data www-data  xxx ... index.html
# -rw-r--r--  1 www-data www-data  xxx ... spotify-auth.js
# etc.
```

## Troubleshooting

### Nginx geeft 403 Forbidden

```bash
# Check permissions
ls -la /var/www/hitster-trainer/

# Fix
sudo chown -R www-data:www-data /var/www/hitster-trainer/
sudo chmod -R 755 /var/www/hitster-trainer/
sudo systemctl restart nginx
```

### Bestanden kunnen niet geüpdatet worden

```bash
# Geef tijdelijk jezelf write permissions
sudo chown -R jeffrey:www-data /var/www/hitster-trainer/
sudo chmod -R 775 /var/www/hitster-trainer/

# Nu kun je bestanden updaten zonder sudo
cp nieuwe-file.js /var/www/hitster-trainer/

# Zet permissions terug naar veilig
sudo chown -R www-data:www-data /var/www/hitster-trainer/
sudo chmod -R 755 /var/www/hitster-trainer/
```

### SELinux Issues (op sommige systemen)

Als je SELinux hebt (meestal op RedHat/CentOS, niet Ubuntu):

```bash
# Check SELinux status
getenforce

# Fix SELinux context
sudo chcon -R -t httpd_sys_content_t /var/www/hitster-trainer/

# Of disable SELinux (niet aanbevolen voor productie)
sudo setenforce 0
```

## Permissions Uitleg

### Directories (755 = rwxr-xr-x)
- **Owner (www-data)**: Read, Write, Execute
- **Group**: Read, Execute
- **Others**: Read, Execute

### Files (644 = rw-r--r--)
- **Owner (www-data)**: Read, Write
- **Group**: Read
- **Others**: Read

## Quick Reference

```bash
# Single file fix
sudo chown www-data:www-data /var/www/hitster-trainer/file.js
sudo chmod 644 /var/www/hitster-trainer/file.js

# Directory fix
sudo chown www-data:www-data /var/www/hitster-trainer/
sudo chmod 755 /var/www/hitster-trainer/

# Recursive fix (alle bestanden en directories)
sudo chown -R www-data:www-data /var/www/hitster-trainer/
sudo chmod -R 755 /var/www/hitster-trainer/

# Herstart Nginx
sudo systemctl restart nginx

# Check logs als het niet werkt
sudo tail -f /var/log/nginx/hitster-trainer_error.log
```

## Na elke update

Als je bestanden update via SCP, run altijd:

```bash
# Fix ownership en permissions
sudo chown -R www-data:www-data /var/www/hitster-trainer/
sudo chmod -R 755 /var/www/hitster-trainer/

# Herstart Nginx (alleen nodig bij config changes)
sudo systemctl reload nginx
```

## Automated Fix Script

Maak een script `/home/jeffrey/fix-permissions.sh`:

```bash
#!/bin/bash
echo "🔧 Fixing Hitster Trainer permissions..."
sudo chown -R www-data:www-data /var/www/hitster-trainer/
sudo chmod -R 755 /var/www/hitster-trainer/
sudo find /var/www/hitster-trainer/ -type f -exec chmod 644 {} \;
sudo systemctl reload nginx
echo "✅ Done!"
```

Maak het executable:
```bash
chmod +x /home/jeffrey/fix-permissions.sh
```

Dan kun je na elke update gewoon runnen:
```bash
./fix-permissions.sh
```
