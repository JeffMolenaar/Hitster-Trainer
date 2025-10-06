# Spotify Invalid Redirect URI - Troubleshooting

## Error: INVALID_CLIENT: Invalid redirect URI

Deze fout betekent dat de redirect URI in je code niet exact matcht met wat je hebt geconfigureerd in het Spotify Developer Dashboard.

## Checklist voor het oplossen:

### 1. Check je huidige redirect URI in de code

Wat staat er in `spotify-auth.js` regel 7?
```javascript
this.redirectUri = 'https://your-domain.com/callback.html';
```

Deze moet je aanpassen naar je ECHTE domein.

### 2. Exacte Match is vereist!

Spotify is EXTREEM strikt. Deze moeten 100% identiek zijn:

**In je code (spotify-auth.js):**
```javascript
this.redirectUri = 'https://hitster.millercodings.nl/callback.html';
```

**In Spotify Developer Dashboard:**
```
https://hitster.millercodings.nl/callback.html
```

### 3. Veel voorkomende fouten:

❌ **Trailing slash**
```
Code:     https://hitster.millercodings.nl/callback.html
Spotify:  https://hitster.millercodings.nl/callback.html/
→ NIET OK! Extra slash aan het einde
```

❌ **www subdomain mismatch**
```
Code:     https://hitster.millercodings.nl/callback.html
Spotify:  https://www.hitster.millercodings.nl/callback.html
→ NIET OK! www verschil
```

❌ **http vs https**
```
Code:     https://hitster.millercodings.nl/callback.html
Spotify:  http://hitster.millercodings.nl/callback.html
→ NIET OK! Moet beiden HTTPS zijn
```

❌ **Hoofdletters**
```
Code:     https://hitster.millercodings.nl/callback.html
Spotify:  https://Hitster.MillerCodings.nl/callback.html
→ NIET OK! Case sensitive
```

✅ **Correct**
```
Code:     https://hitster.millercodings.nl/callback.html
Spotify:  https://hitster.millercodings.nl/callback.html
→ PERFECT! Exact hetzelfde
```

## Stappen om op te lossen:

### Stap 1: Check je daadwerkelijke URL

Open je browser en ga naar:
```
https://hitster.millercodings.nl
```

Let op:
- Redirect het naar www? Dan gebruik `www.hitster.millercodings.nl`
- Blijft het zonder www? Dan gebruik `hitster.millercodings.nl`

### Stap 2: Update spotify-auth.js

```javascript
// Gebruik EXACT de URL zoals je site werkt
this.redirectUri = 'https://hitster.millercodings.nl/callback.html';
```

### Stap 3: Update Spotify Developer Dashboard

1. Ga naar https://developer.spotify.com/dashboard
2. Klik op je app
3. Klik op "Settings"
4. Scroll naar "Redirect URIs"
5. Klik "Edit"
6. Voeg toe (of wijzig bestaande):
   ```
   https://hitster.millercodings.nl/callback.html
   ```
7. **BELANGRIJK**: Klik op "ADD" knop (niet vergeten!)
8. Klik op "SAVE" onderaan

### Stap 4: Wacht 1-2 minuten

Spotify heeft soms even nodig om de wijziging door te voeren. Wacht 1-2 minuten na het opslaan.

### Stap 5: Test opnieuw

1. Hard refresh je browser (Ctrl+F5 of Cmd+Shift+R)
2. Clear je browser cache
3. Probeer opnieuw in te loggen

## Debug: Check wat er echt verstuurd wordt

Voeg deze code toe aan `spotify-auth.js` in de `login()` functie:

```javascript
login() {
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('scope', this.scopes);

    // DEBUG: Log de redirect URI
    console.log('🔍 Redirect URI being sent:', this.redirectUri);
    console.log('🔍 Full auth URL:', authUrl.toString());

    window.location.href = authUrl.toString();
}
```

Open de browser console (F12) en kijk wat er gelogd wordt. Dit is de EXACTE URI die naar Spotify wordt gestuurd.

## Double Check in Spotify Dashboard

Soms zit er een spatie of onzichtbaar karakter in de Spotify Dashboard.

1. Kopieer de redirect URI uit Spotify Dashboard
2. Plak in een text editor (Notepad++)
3. Check of er geen spaties voor/achter staan
4. Check of het exact hetzelfde is als in je code

## Als het nog steeds niet werkt:

### Test met window.location.origin

Probeer dit tijdelijk om te zien wat de browser denkt dat de URL is:

```javascript
// In spotify-auth.js constructor
constructor() {
    this.clientId = '8f31b962554b4366b0a594175be737c6';
    
    // DEBUG: Laat zien wat de browser denkt dat de origin is
    console.log('🔍 Window location origin:', window.location.origin);
    console.log('🔍 Window location href:', window.location.href);
    
    // Gebruik de browser's origin
    this.redirectUri = window.location.origin + '/callback.html';
    console.log('🔍 Using redirect URI:', this.redirectUri);
    
    // ... rest of code
}
```

Dit zorgt ervoor dat de redirect URI automatisch correct is, ongeacht of je www gebruikt of niet.

## Let's Encrypt / Nginx Redirect Issue

Als je Nginx automatisch redirect van HTTP naar HTTPS, check dan:

```bash
# Check je Nginx config
cat /etc/nginx/sites-enabled/hitster.millercodings.nl | grep server_name

# Zorg ervoor dat BEIDE versies (met en zonder www) correct redirecten
```

## Summary Checklist

- [ ] Redirect URI in code is exact hetzelfde als in Spotify Dashboard
- [ ] Geen trailing slashes
- [ ] Geen www verschil
- [ ] Beide HTTPS
- [ ] Geen hoofdletter verschillen
- [ ] Op "ADD" en "SAVE" geklikt in Spotify Dashboard
- [ ] 1-2 minuten gewacht na opslaan
- [ ] Browser cache gecleared
- [ ] Bestanden op server zijn geüpdatet (niet vergeten te deployen!)

## Quick Fix: Gebruik window.location.origin

De makkelijkste oplossing om dit soort problemen te voorkomen:

```javascript
this.redirectUri = window.location.origin + '/callback.html';
```

Dit zorgt ervoor dat de redirect URI altijd automatisch correct is! 🎯
