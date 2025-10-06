# 🎵 Spotify ID Lookup Tool

## Wat doet deze tool?

Deze tool zoekt automatisch Spotify track IDs voor een lijst met nummers. Je hoeft alleen maar de artiest, titel en jaar in te voeren, en de tool doet de rest!

## Hoe werkt het?

### Stap 1: Open de tool
Ga naar: `http://localhost:3000/id-lookup.html` (of je live URL)

### Stap 2: Login met Spotify
- Als je nog niet bent ingelogd, klik op "Login met Spotify"
- Geef de benodigde permissies

### Stap 3: Plak je JSON lijst
Plak je lijst met nummers in het tekstvak. Format:
```json
[
    {
        "artist": "Barry White",
        "title": "You're The First, The Last, My Everything",
        "year": 1974,
        "spotifyId": ""
    },
    {
        "artist": "ABBA",
        "title": "Waterloo",
        "year": 1974,
        "spotifyId": ""
    }
]
```

### Stap 4: Klik op "🔍 Zoek Spotify IDs"
De tool begint automatisch met zoeken:
- Elke 0.5 seconde wordt er een nummer gezocht (Spotify rate limiting)
- Je ziet een progress bar met de voortgang
- Gevonden nummers worden direct getoond

### Stap 5: Controleer de resultaten

Elk resultaat toont:
- ✅ **Groen**: Perfecte match (80%+)
- ⚠️ **Oranje**: Goede match (60-80%)
- ❌ **Rood**: Zwakke match (<60%) of niet gevonden

Je kunt:
- **Audio preview** beluisteren om te checken of het klopt
- **Confidence score** zien (hoeveel % match)
- **Album art** bekijken
- **Handmatig wijzigen** als de match niet klopt

### Stap 6: Handmatig corrigeren (optioneel)

Voor nummers die niet gevonden zijn of een slechte match hebben:
1. Klik op "✏️ Handmatig" of "🔄 Wijzig"
2. Voer het correcte Spotify ID in
3. Klik op "💾 Save"

**Hoe vind je een Spotify ID?**
1. Open Spotify app/web
2. Zoek het nummer
3. Klik met rechtermuisknop → "Deel" → "Link naar nummer kopiëren"
4. De URL ziet er zo uit: `https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT`
5. Het ID is het laatste deel: `4cOdK2wGLETKBW3PvgPWqT`

### Stap 7: Opslaan

Je hebt 3 opties:
- **💾 Save to hitster-songs.js**: Download een compleet hitster-songs.js bestand
- **⬇️ Download JSON**: Download alleen de JSON data
- **📋 Copy to Clipboard**: Kopieer naar clipboard

## Features

### 🎯 Intelligente Matching
De tool gebruikt een smart algoritme dat:
- Artist naam vergelijkt (40 punten)
- Track titel vergelijkt (40 punten)
- Release jaar vergelijkt (20 punten)
- Totaal: 100 punten max = perfecte match

### 📊 Statistieken
Na het zoeken zie je:
- Totaal aantal nummers
- Aantal gevonden
- Aantal niet gevonden
- Gemiddelde match percentage

### 🎵 Audio Preview
Voor elk gevonden nummer kun je direct een 30-seconden preview beluisteren om te checken of het klopt.

### 🔄 Rate Limiting
De tool respecteert Spotify's API limits:
- Max 1 request per 0.5 seconde
- Voorkomt dat je geblokkeerd wordt

## Voorbeeld Workflow

```
1. Open id-lookup.html
2. Login met Spotify
3. Plak je lijst met 400 nummers
4. Klik "Zoek Spotify IDs"
5. Wacht ~3-4 minuten (400 songs × 0.5s = 200s)
6. Controleer resultaten
7. Corrigeer handmatig waar nodig
8. Download hitster-songs.js
9. Upload naar je project
10. Klaar! 🎉
```

## Troubleshooting

### "Login Required" blijft verschijnen
- Clear je browser cache
- Controleer of je op een HTTPS URL zit (localhost is OK)
- Check of de redirect URI klopt in Spotify Dashboard

### "Invalid Spotify ID" bij handmatig invoeren
- Controleer of je alleen het ID hebt (niet de hele URL)
- Format: `4cOdK2wGLETKBW3PvgPWqT` (geen https://... ervoor)

### Nummers worden niet gevonden
Mogelijke redenen:
- Artiestnaam is anders geschreven op Spotify
- Nummer staat niet op Spotify (te oud, regionale restrict, etc.)
- Typefout in originele lijst

**Oplossing**: Gebruik de handmatige input optie

### Tool is langzaam
Dit is normaal! Om Spotify's rate limits te respecteren:
- 100 nummers = ~50 seconden
- 400 nummers = ~3-4 minuten

**Tip**: Verwerk grote lijsten in batches van 50-100 nummers

## Tips voor Beste Resultaten

1. **Controleer spelling**: Zorg dat artiest/titel correct gespeld zijn
2. **Gebruik officiële namen**: Bijv. "The Beatles" niet "Beatles"
3. **Jaar klopt**: Gebruik release jaar, niet remaster jaar
4. **Check featured artists**: "Drake (feat. Rihanna)" werkt beter dan alleen "Drake"
5. **Luister audio preview**: Altijd checken of het het juiste nummer is!

## Technische Details

### API Calls
- Gebruikt Spotify Web API `/search` endpoint
- Zoekt met query: `artist:{artist} track:{title}`
- Returns top 10 results, selecteert beste match

### Matching Algoritme
```javascript
Score = ArtistMatch (40) + TitleMatch (40) + YearMatch (20)

ArtistMatch:
- Exact = 40 punten
- Bevat = 25 punten

TitleMatch:
- Exact = 40 punten
- Bevat = 25 punten

YearMatch:
- Exact = 20 punten
- ±1 jaar = 15 punten
- ±2 jaar = 10 punten
- ±5 jaar = 5 punten
```

### Rate Limiting
- 0.5 seconde delay tussen requests
- Voorkomt 429 (Too Many Requests) errors

## Shortcuts

- **Load Example**: Laadt een voorbeeld lijst van 3 nummers
- **Clear**: Wist het input veld
- **Reset Tool**: Start opnieuw (nieuwe lijst)

## Integratie met Hitster Trainer

Het gegenereerde `hitster-songs.js` bestand kun je direct gebruiken:
1. Download het bestand
2. Replace de oude `hitster-songs.js` in je project
3. De game werkt direct met de nieuwe nummers!

## Veiligheid

- Alle API calls gaan direct naar Spotify (geen tussenserver)
- Je access token wordt alleen in je browser opgeslagen
- Geen data wordt ergens anders opgeslagen

## Support

Problemen? Check:
1. Console (F12) voor error messages
2. Network tab voor API responses
3. Spotify Dashboard voor API status

Veel plezier met je Hitster game! 🎉🎵
