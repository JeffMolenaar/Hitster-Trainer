# Nginx Conflicting Server Names - Troubleshooting Guide

## Probleem
Je krijgt deze warnings:
```
nginx: [warn] conflicting server name "hitster.millercodings.nl" on 0.0.0.0:443, ignored
nginx: [warn] conflicting server name "hitster.millercodings.nl" on 0.0.0.0:80, ignored
```

Dit betekent dat de server_name al bestaat in een andere configuratie.

## Oplossing

### Stap 1: Vind alle configuraties met deze server_name

```bash
# Zoek naar alle bestanden met deze server_name
grep -r "hitster.millercodings.nl" /etc/nginx/sites-enabled/

# Of zoek in sites-available
grep -r "hitster.millercodings.nl" /etc/nginx/sites-available/
```

### Stap 2: Check welke configuratie er is

Je hebt waarschijnlijk:
1. Een oude/dubbele configuratie met dezelfde server_name
2. Of je hebt per ongeluk twee symbolic links gemaakt

```bash
# Lijst alle enabled sites
ls -la /etc/nginx/sites-enabled/

# Check of er dubbele links zijn
ls -la /etc/nginx/sites-enabled/ | grep hitster
```

### Stap 3A: Als er een dubbele configuratie is - Verwijder de oude

```bash
# Verwijder de oude configuratie (pas de naam aan naar wat je vindt)
sudo rm /etc/nginx/sites-enabled/hitster.millercodings.nl.old
# of
sudo rm /etc/nginx/sites-enabled/old-hitster-config

# Test en herlaad
sudo nginx -t && sudo systemctl reload nginx
```

### Stap 3B: Als er een duplicate symbolic link is

```bash
# Verwijder ALLE hitster links
sudo rm /etc/nginx/sites-enabled/hitster*

# Maak een nieuwe, enkele link
sudo ln -s /etc/nginx/sites-available/hitster.millercodings.nl /etc/nginx/sites-enabled/

# Test en herlaad
sudo nginx -t && sudo systemctl reload nginx
```

### Stap 4: Check de andere warnings ook

Je hebt ook conflicts met:
- "_" (catch-all server)
- "staging.smarthuisje.nl"
- "staging2.macmiller.nl"

Deze zijn waarschijnlijk niet kritiek, maar als je ze wilt oplossen:

```bash
# Vind alle configuraties met deze names
grep -r "server_name _" /etc/nginx/sites-enabled/
grep -r "staging.smarthuisje.nl" /etc/nginx/sites-enabled/
grep -r "staging2.macmiller.nl" /etc/nginx/sites-enabled/

# Check welke bestanden duplicates hebben
ls -la /etc/nginx/sites-enabled/
```

## Beste Praktijk: Unieke Configuratie Namen

Gebruik unieke bestandsnamen voor je configurations:

```bash
# Goed:
/etc/nginx/sites-available/hitster.millercodings.nl
/etc/nginx/sites-available/staging.smarthuisje.nl

# Niet goed (kan verwarring geven):
/etc/nginx/sites-available/default
/etc/nginx/sites-available/site.conf
```

## Quick Fix voor Hitster Trainer

```bash
# 1. Verwijder alle hitster links
sudo rm /etc/nginx/sites-enabled/hitster*

# 2. Check dat het bestand bestaat in sites-available
ls -la /etc/nginx/sites-available/ | grep hitster

# 3. Maak één enkele link
sudo ln -s /etc/nginx/sites-available/hitster.millercodings.nl /etc/nginx/sites-enabled/hitster.millercodings.nl

# 4. Verifieer dat er maar één is
ls -la /etc/nginx/sites-enabled/ | grep hitster

# 5. Test en herlaad
sudo nginx -t && sudo systemctl reload nginx
```

## Verificatie dat het werkt

Na het oplossen van de conflicts:

```bash
# Test de configuratie - should have NO warnings
sudo nginx -t

# Check of de site werkt
curl -I http://hitster.millercodings.nl
curl -I https://hitster.millercodings.nl

# Check Nginx logs
sudo tail -f /var/log/nginx/hitster-trainer_error.log
```

## Note over de warnings

**Belangrijk**: Ook al geeft Nginx deze warnings, de configuratie werkt meestal nog steeds!
- De EERSTE configuratie met die server_name wordt gebruikt
- De TWEEDE wordt "ignored" (genegeerd)
- Maar het is beter om het op te lossen voor de duidelijkheid

## Als het nog steeds niet werkt

Stuur me de output van:

```bash
# Laat alle enabled sites zien
ls -la /etc/nginx/sites-enabled/

# Laat de inhoud van je hitster config zien
cat /etc/nginx/sites-enabled/hitster.millercodings.nl | head -30

# Check of er andere configs zijn met dezelfde server_name
grep -r "hitster.millercodings.nl" /etc/nginx/sites-enabled/
```
