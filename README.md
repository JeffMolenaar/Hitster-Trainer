# Hitster-Trainer
Hitster (Bordspel) trainer - Train jezelf in het herkennen van hits, artiesten en jaartallen!

## Over Hitster Trainer

Deze applicatie helpt je oefenen voor het bordspel Hitster. Je krijgt random vragen over bekende hits en moet raden welke artiest het zingt, uit welk jaar het komt, of wat de titel is. De muziek wordt automatisch afgespeeld via Spotify tijdens elke vraag.

## Features

- 🎵 **50+ bekende hits** uit verschillende decennia
- 🎯 **3 soorten vragen**: Artiest, jaartal, of songtitel
- 🎧 **Automatisch afspelen** via Spotify Web Playback SDK
- 📊 **Score bijhouden** tijdens de quiz
- 🎨 **Responsive design** voor mobiel en desktop
- 🔐 **Veilige Spotify authenticatie**

## Setup Instructies

### 1. Spotify App Registreren

1. Ga naar [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in met je Spotify account
3. Klik op "Create App"
4. Vul de app details in:
   - **App name**: Hitster Trainer (of eigen keuze)
   - **App description**: Training app voor Hitster bordspel
   - **Website**: Je website URL (of gebruik http://localhost:3000)
   - **Redirect URIs**: Voeg toe: `http://localhost:3000/callback.html` (en je productie URL als je die hebt)
5. Accepteer de Spotify Developer Terms of Service
6. Klik "Save"

### 2. Client ID Configureren

1. Kopieer de **Client ID** van je Spotify app
2. Open `spotify-auth.js` in een teksteditor
3. Vervang `'your_spotify_client_id_here'` met je echte Client ID:
   ```javascript
   this.clientId = 'jouw_client_id_hier'; // Vervang met je Client ID
   ```

### 3. Applicatie Draaien

#### Optie A: Met een lokale webserver (aanbevolen)

```bash
# Met Python (als je Python hebt geïnstalleerd)
python -m http.server 3000

# Of met Node.js (als je Node.js hebt geïnstalleerd)
npx serve -p 3000

# Of met PHP (als je PHP hebt geïnstalleerd)
php -S localhost:3000
```

#### Optie B: Direct bestand openen

Je kunt ook `index.html` direct in je browser openen, maar sommige browsers blokkeren lokale bestanden voor veiligheidsredenen.

### 4. Applicatie Gebruiken

1. Open http://localhost:3000 in je browser
2. Klik op "Verbind met Spotify"
3. Log in met je Spotify account
4. Geef toestemming voor de benodigde rechten
5. Je wordt teruggeleid naar de app
6. Begin met de quiz!

## VS Code Setup (Aanbevolen)

Dit project is geconfigureerd als een VS Code project met handige extensies en instellingen.

### VS Code Openen

```bash
# Optie 1: Open het workspace bestand (Aanbevolen)
code Hitster-Trainer.code-workspace

# Optie 2: Open de huidige folder
code .
```

**Voordelen van het workspace bestand:**
- Alle settings, extensions en tasks zijn automatisch geladen
- Consistent ontwikkelomgeving voor alle teamleden
- Eenvoudig te delen en versiebeheer

### Aanbevolen Extensies

Bij het openen van het project wordt je gevraagd om de aanbevolen extensies te installeren. De belangrijkste zijn:

- **Live Server** - Voor het draaien van een lokale webserver met live reload
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Auto Rename Tag** - Automatisch HTML tags hernoemen
- **HTML CSS Support** - Verbeterde HTML/CSS ondersteuning
- **Path Intellisense** - Autocomplete voor bestandspaden
- **Markdown Preview** - Preview voor Markdown bestanden

### Server Starten in VS Code

#### Optie 1: Live Server Extensie (Aanbevolen)
1. Installeer de Live Server extensie
2. Klik rechts onderin op "Go Live" 
3. Of rechtermuisklik op `index.html` en selecteer "Open with Live Server"

#### Optie 2: Via Tasks Menu
1. Druk op `Ctrl+Shift+P` (of `Cmd+Shift+P` op Mac)
2. Type "Tasks: Run Task"
3. Kies een van de server opties:
   - "Start Local Server (Python)"
   - "Start Local Server (Node.js)"
   - "Start Local Server (PHP)"

### Debuggen in VS Code

1. Zorg dat de server draait op http://localhost:3000
2. Druk op `F5` of ga naar "Run and Debug" sidebar
3. Selecteer "Launch Chrome with Live Server"
4. Chrome wordt geopend met de debugger aangesloten
5. Je kunt nu breakpoints zetten in je JavaScript bestanden

## Hoe te Spelen

1. **Start de quiz** - Je krijgt 10 willekeurige vragen
2. **Luister naar het nummer** - Klik op "▶️ Speel af" om het nummer te horen
3. **Kies het juiste antwoord** - Selecteer uit 4 opties
4. **Zie je resultaat** - Direct feedback na elke vraag
5. **Bekijk je eindscore** - Na 10 vragen zie je je totaalscore

## Technische Details

### Stack
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **API**: Spotify Web API + Web Playback SDK
- **Authenticatie**: Spotify OAuth 2.0
- **Data**: JSON database met 50+ bekende hits

### Benodigde Spotify Rechten
- `streaming` - Voor het afspelen van muziek
- `user-read-email` - Voor gebruikersprofiel
- `user-read-private` - Voor gebruikersprofiel
- `user-read-playback-state` - Voor playback status
- `user-modify-playback-state` - Voor playback controle

### Browser Compatibiliteit
- Chrome 54+
- Firefox 52+
- Safari 14+
- Edge 79+

## Song Database

De applicatie bevat 50+ bekende hits van artiesten zoals:
- Queen, The Beatles, Michael Jackson
- ABBA, Led Zeppelin, Pink Floyd
- Nirvana, Coldplay, Adele
- En veel meer uit verschillende decennia!

## Troubleshooting

### "Client ID niet geconfigureerd"
- Zorg ervoor dat je de Client ID hebt ingevuld in `spotify-auth.js`

### "Kan nummer niet afspelen"
- Controleer of je Spotify Premium hebt (vereist voor Web Playback SDK)
- Zorg dat andere Spotify apps gesloten zijn
- Herlaad de pagina en probeer opnieuw

### "Redirect URI mismatch"
- Controleer of de redirect URI in je Spotify app overeenkomt met de URL van je applicatie

## Contributing

Wil je meer songs toevoegen of features implementeren? Check de code in:
- `hitster-songs.js` - Voor meer songs
- `quiz.js` - Voor quiz logica
- `style.css` - Voor styling aanpassingen

## License

Dit project is open source en bedoeld voor educatieve doeleinden.
