# 🚀 Deployment Instructies - Spotify ID Lookup Tool

## Wat is er nieuw?

✅ **Spotify ID Lookup Tool** toegevoegd:
- Automatisch zoeken naar Spotify IDs voor nummers
- Intelligent matching algoritme
- Audio previews voor verificatie
- Handmatige correctie mogelijkheid
- Direct exporteren naar hitster-songs.js

✅ **Admin Tools knop** toegevoegd aan hoofdmenu:
- Klik op "🔧 Admin Tools" om naar de ID lookup tool te gaan
- Alleen zichtbaar als je bent ingelogd

## Server Deployment

### Stap 1: SSH naar je server
```bash
ssh jeffrey@192.168.2.191
```

### Stap 2: Run het update script
```bash
/home/jeffrey/update-from-git.sh
```

Het script zal automatisch:
- ✅ De laatste code van GitHub clonen
- ✅ Alle nieuwe bestanden kopiëren:
  - `id-lookup.html` (nieuwe pagina)
  - `spotify-id-lookup.js` (lookup logica)
  - `SPOTIFY-ID-LOOKUP-GUIDE.md` (documentatie)
  - `index.html` (met admin tools knop)
- ✅ Permissies fixen
- ✅ Nginx herladen

### Stap 3: Test het
Open in je browser:
```
https://hitster.millercodings.nl/
```

1. Login met Spotify
2. Klik op "🔧 Admin Tools" (rechts bovenin bij mode selectie)
3. Je komt op de ID Lookup pagina

## Hoe te gebruiken

### Voor normale gebruikers:
- Gewoon de game spelen zoals normaal
- Admin Tools knop is er, maar alleen nodig voor beheerders

### Voor admins (jou):
1. Ga naar `https://hitster.millercodings.nl/id-lookup.html`
2. Login met Spotify (als je dat nog niet hebt gedaan)
3. Plak je JSON lijst met nummers zonder Spotify IDs
4. Klik "🔍 Zoek Spotify IDs"
5. Wacht tot alle nummers zijn gezocht
6. Controleer de resultaten (audio previews)
7. Corrigeer handmatig waar nodig
8. Download het gegenereerde `hitster-songs.js` bestand
9. Upload naar server en vervang het oude bestand

## Snelle Test

Na deployment, test dit:

### Test 1: Hoofdpagina
```
https://hitster.millercodings.nl/
```
✅ Login werkt
✅ "🔧 Admin Tools" knop zichtbaar na login

### Test 2: ID Lookup Tool
```
https://hitster.millercodings.nl/id-lookup.html
```
✅ Pagina laadt
✅ Login prompt verschijnt of je bent al ingelogd
✅ JSON input veld werkt
✅ "Load Example" knop werkt

### Test 3: Functionaliteit
1. Klik "Load Example" op ID lookup pagina
2. Klik "🔍 Zoek Spotify IDs"
3. Wacht ~2 seconden (3 nummers × 0.5s)
4. Controleer of resultaten verschijnen met:
   - Album art
   - Audio previews
   - Confidence scores
   - Spotify IDs

## Complete Deployment Command

Op de server in één commando:
```bash
ssh jeffrey@192.168.2.191 "/home/jeffrey/update-from-git.sh"
```

## Files Overview

Nieuwe bestanden op server na deployment:
```
/var/www/hitster-trainer/
├── id-lookup.html                 (nieuwe pagina)
├── spotify-id-lookup.js           (nieuwe logica)
├── SPOTIFY-ID-LOOKUP-GUIDE.md     (documentatie)
├── index.html                     (updated met admin knop)
├── ... (alle andere bestaande files)
```

## Rollback (als er problemen zijn)

Als er iets mis gaat:
```bash
ssh jeffrey@192.168.2.191
cd /var/www/hitster-trainer
sudo git checkout HEAD~1 -- index.html  # Oude versie terugzetten
sudo systemctl reload nginx
```

## Belangrijke Notes

⚠️ **Admin Tools knop**:
- Zichtbaar voor iedereen die is ingelogd
- Dit is OK voor een private tool
- Als je het verborgen wilt maken: verwijder de knop uit index.html

⚠️ **Spotify API Limits**:
- De lookup tool gebruikt 0.5s delay tussen requests
- 100 nummers = ~50 seconden
- 400 nummers = ~3-4 minuten

⚠️ **HTTPS Required**:
- De tool werkt alleen op HTTPS (Spotify requirement)
- Je server heeft al SSL via Let's Encrypt ✅

## Troubleshooting

### ID Lookup pagina laadt niet
```bash
# Check of bestand bestaat
ssh jeffrey@192.168.2.191 "ls -la /var/www/hitster-trainer/id-lookup.html"

# Check permissions
ssh jeffrey@192.168.2.191 "ls -la /var/www/hitster-trainer/ | grep id-lookup"
```

### Admin Tools knop verschijnt niet
- Clear browser cache (Ctrl+F5)
- Check of je bent ingelogd met Spotify
- Open DevTools Console (F12) voor errors

### Spotify zoeken werkt niet
- Controleer of je access token nog geldig is
- Logout en login opnieuw
- Check Console (F12) voor API errors

## Success Checklist

Na deployment, controleer:
- ✅ `https://hitster.millercodings.nl/` laadt
- ✅ Login met Spotify werkt
- ✅ "🔧 Admin Tools" knop zichtbaar
- ✅ `https://hitster.millercodings.nl/id-lookup.html` laadt
- ✅ Example lijst laden werkt
- ✅ Spotify zoeken werkt
- ✅ Audio previews werken
- ✅ Download JSON/JS werkt

## Klaar! 🎉

Je kunt nu:
1. De game spelen op https://hitster.millercodings.nl/
2. De ID lookup tool gebruiken voor nieuwe nummers
3. Makkelijk hitster-songs.js updaten

Veel plezier met je uitgebreide Hitster platform! 🎵
