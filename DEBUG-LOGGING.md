# 🔍 Debug Logging voor Spotify ID Lookup Tool

## Overzicht

Debug logging systeem dat alle Spotify API responses logt naar een server-side log bestand. Handig voor troubleshooting waarom preview URLs `null` zijn.

## Locatie

**Log bestand:** `/home/jeffrey/spotify-lookup-debug.log`

## Hoe te gebruiken

### 1. Debug Mode Inschakelen

1. Ga naar https://hitster.millercodings.nl/id-lookup.html
2. Vink het **"🔍 Debug Mode"** checkbox aan bovenaan de pagina
3. Start je song lookup zoals normaal
4. Alle API responses worden nu gelogd!

### 2. Log Bekijken

#### Optie A: Via Helper Script (Makkelijkst!)

```powershell
# Run in PowerShell
.\view-debug-log.ps1
```

Kies uit:
- Live monitoring (tail -f)
- Laatste 50 regels
- Zoeken naar specifiek nummer
- Preview URL statistieken
- Log leegmaken
- Log downloaden

#### Optie B: Direct via SSH

```bash
# Live monitoring
ssh jeffrey@192.168.2.191
tail -f /home/jeffrey/spotify-lookup-debug.log

# Laatste 100 regels
tail -100 /home/jeffrey/spotify-lookup-debug.log

# Zoek naar specifiek nummer
grep -i "barry white" /home/jeffrey/spotify-lookup-debug.log

# Toon alleen matches zonder preview URL
grep -B2 "hasPreview.*false" /home/jeffrey/spotify-lookup-debug.log
```

## Log Format

Elke entry bevat:

```
[2025-10-03 07:50:15] [SEARCH] Searching: Barry White - You're The First, The Last, My Everything (1974)
Details: {
    "query": "artist:Barry White track:You're The First, The Last, My Everything",
    "encodedQuery": "..."
}
--------------------------------------------------------------------------------
[2025-10-03 07:50:16] [API_RESPONSE] Received 10 results
Details: {
    "totalResults": 10,
    "firstThreeResults": [
        {
            "id": "5dXJ1SoksFkgdx3yxIoYNO",
            "name": "You're The First, The Last, My Everything",
            "artist": "Barry White",
            "year": "1974",
            "previewUrl": "https://p.scdn.co/mp3-preview/...",
            "hasPreview": true
        }
    ]
}
--------------------------------------------------------------------------------
[2025-10-03 07:50:16] [MATCH_FOUND] Best match: Barry White - You're The First, The Last, My Everything
Details: {
    "spotifyId": "5dXJ1SoksFkgdx3yxIoYNO",
    "confidence": 100,
    "previewUrl": "https://p.scdn.co/mp3-preview/...",
    "hasPreview": true,
    "releaseDate": "1974"
}
--------------------------------------------------------------------------------
```

## Log Types

- **SYSTEM** - Debug mode aan/uit
- **SEARCH** - Zoek query verstuurd
- **API_RESPONSE** - Resultaten ontvangen van Spotify
- **MATCH_FOUND** - Beste match gevonden
- **NO_RESULTS** - Geen resultaten
- **API_ERROR** - Spotify API fout
- **ERROR** - Algemene fout
- **MANUAL_INPUT** - Handmatige ID invoer
- **MANUAL_SUCCESS** - Handmatige ID succesvol
- **MANUAL_ERROR** - Handmatige ID fout

## Preview URL Analyse

### Check hoeveel songs preview URLs hebben:

```bash
ssh jeffrey@192.168.2.191

# Totaal aantal matches
grep "MATCH_FOUND" /home/jeffrey/spotify-lookup-debug.log | wc -l

# Met preview URL
grep "hasPreview.*true" /home/jeffrey/spotify-lookup-debug.log | wc -l

# Zonder preview URL (PROBLEEM!)
grep "hasPreview.*false" /home/jeffrey/spotify-lookup-debug.log | wc -l
```

### Toon welke songs GEEN preview hebben:

```bash
grep -B5 "hasPreview.*false" /home/jeffrey/spotify-lookup-debug.log | grep "SEARCH"
```

## Log Onderhoud

### Log Leegmaken

```bash
ssh jeffrey@192.168.2.191
echo "" > /home/jeffrey/spotify-lookup-debug.log
```

Of gebruik het helper script (optie 5).

### Log Downloaden

```bash
scp jeffrey@192.168.2.191:/home/jeffrey/spotify-lookup-debug.log ./debug-backup.log
```

Of gebruik het helper script (optie 6).

## Troubleshooting

### Preview URLs zijn null

Als je in de log ziet:
```json
"hasPreview": false
```

Dan heeft Spotify **geen preview URL** voor dat specifieke nummer. Dit kan zijn omdat:

1. **Oude nummers** - Voor 1960 hebben vaak geen previews
2. **Niche artiesten** - Kleine labels hebben soms geen previews
3. **Rechten issues** - Preview rechten verschillen per land/regio
4. **Verkeerde match** - Mogelijk verkeerd album/versie gevonden

**Oplossing:** 
- Zoek handmatig naar een andere versie (bijv. remaster, greatest hits album)
- Gebruik de "✏️ Handmatig" knop om een alternatief Spotify ID in te voeren

### Log file niet beschrijfbaar

```bash
ssh jeffrey@192.168.2.191
chmod 666 /home/jeffrey/spotify-lookup-debug.log
```

### Debug logging werkt niet

1. Check of debug mode aangevinkt is
2. Check browser console (F12) voor errors
3. Check of `debug-logger.php` bestaat:
   ```bash
   ssh jeffrey@192.168.2.191
   ls -lh /var/www/hitster-trainer/debug-logger.php
   ```

## Files

- **debug-logger.php** - Server-side logging endpoint
- **spotify-id-lookup.js** - Client-side met debug functionaliteit
- **id-lookup.html** - UI met debug toggle
- **view-debug-log.ps1** - PowerShell helper script

## Volgende Stappen

1. ✅ Schakel debug mode in
2. ✅ Upload je song lijst opnieuw
3. ✅ Bekijk de log tijdens processing
4. ✅ Check welke songs geen preview URL krijgen
5. ✅ Fix handmatig of verwijder songs zonder preview

Happy debugging! 🐛🔍
