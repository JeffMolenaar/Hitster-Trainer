// Spotify ID Lookup Tool
class SpotifyIDLookup {
    constructor() {
        this.spotifyAuth = null;
        this.songs = [];
        this.results = [];
        this.currentIndex = 0;
        this.stats = {
            total: 0,
            found: 0,
            notFound: 0,
            totalConfidence: 0
        };
    }

    async initialize() {
        // Check if user is authenticated
        if (!spotifyAuth || !spotifyAuth.accessToken) {
            document.getElementById('auth-prompt').style.display = 'block';
            return false;
        }
        document.getElementById('auth-prompt').style.display = 'none';
        return true;
    }

    // Parse JSON input
    parseInput(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (!Array.isArray(parsed)) {
                throw new Error('Input moet een array zijn');
            }
            
            // Validate each song object
            for (let song of parsed) {
                if (!song.artist || !song.title || !song.year) {
                    throw new Error('Elk nummer moet artist, title en year bevatten');
                }
            }
            
            return parsed;
        } catch (error) {
            throw new Error(`JSON Parse Error: ${error.message}`);
        }
    }

    // Search for a song on Spotify
    async searchSpotifySong(artist, title, year) {
        try {
            // Build search query
            const query = `artist:${artist} track:${title}`;
            const encodedQuery = encodeURIComponent(query);
            
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=10`,
                {
                    headers: {
                        'Authorization': `Bearer ${spotifyAuth.accessToken}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Spotify API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
                return null;
            }

            // Find best match
            return this.findBestMatch(data.tracks.items, artist, title, year);
        } catch (error) {
            console.error('Search error:', error);
            return null;
        }
    }

    // Find best matching track from search results
    findBestMatch(tracks, originalArtist, originalTitle, originalYear) {
        let bestMatch = null;
        let highestScore = 0;

        for (let track of tracks) {
            const score = this.calculateMatchScore(
                track,
                originalArtist,
                originalTitle,
                originalYear
            );

            if (score > highestScore) {
                highestScore = score;
                bestMatch = {
                    spotifyId: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    releaseDate: track.album.release_date,
                    imageUrl: track.album.images[0]?.url || '',
                    previewUrl: track.preview_url,
                    confidence: score
                };
            }
        }

        return bestMatch;
    }

    // Calculate match score between track and original
    calculateMatchScore(track, originalArtist, originalTitle, originalYear) {
        let score = 0;

        // Normalize strings for comparison
        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Artist match (40 points)
        const trackArtist = normalize(track.artists[0].name);
        const searchArtist = normalize(originalArtist);
        if (trackArtist === searchArtist) {
            score += 40;
        } else if (trackArtist.includes(searchArtist) || searchArtist.includes(trackArtist)) {
            score += 25;
        }

        // Title match (40 points)
        const trackTitle = normalize(track.name);
        const searchTitle = normalize(originalTitle);
        if (trackTitle === searchTitle) {
            score += 40;
        } else if (trackTitle.includes(searchTitle) || searchTitle.includes(trackTitle)) {
            score += 25;
        }

        // Year match (20 points)
        const trackYear = parseInt(track.album.release_date.substring(0, 4));
        const yearDiff = Math.abs(trackYear - originalYear);
        if (yearDiff === 0) {
            score += 20;
        } else if (yearDiff <= 1) {
            score += 15;
        } else if (yearDiff <= 2) {
            score += 10;
        } else if (yearDiff <= 5) {
            score += 5;
        }

        return score;
    }

    // Process all songs
    async processAllSongs(songs) {
        this.songs = songs;
        this.results = [];
        this.currentIndex = 0;
        this.stats = {
            total: songs.length,
            found: 0,
            notFound: 0,
            totalConfidence: 0
        };

        const progressSection = document.getElementById('progress-section');
        const progressFill = document.getElementById('progress-fill');
        const progressInfo = document.getElementById('progress-info');
        
        progressSection.classList.add('active');

        for (let i = 0; i < songs.length; i++) {
            const song = songs[i];
            this.currentIndex = i;

            // Update progress
            const progress = Math.round(((i + 1) / songs.length) * 100);
            progressFill.style.width = progress + '%';
            progressFill.textContent = progress + '%';
            progressInfo.textContent = `Zoeken naar: ${song.artist} - ${song.title} (${i + 1}/${songs.length})`;

            // Search for song
            const result = await this.searchSpotifySong(song.artist, song.title, song.year);

            if (result) {
                this.stats.found++;
                this.stats.totalConfidence += result.confidence;
                this.results.push({
                    original: song,
                    match: result,
                    status: 'found'
                });
            } else {
                this.stats.notFound++;
                this.results.push({
                    original: song,
                    match: null,
                    status: 'notfound'
                });
            }

            // Rate limiting: wait 0.5 seconds between requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        progressSection.classList.remove('active');
        this.displayResults();
    }

    // Display results
    displayResults() {
        const resultsSection = document.getElementById('results-section');
        const resultsList = document.getElementById('results-list');
        
        resultsSection.classList.add('active');

        // Update stats
        document.getElementById('stat-total').textContent = this.stats.total;
        document.getElementById('stat-found').textContent = this.stats.found;
        document.getElementById('stat-notfound').textContent = this.stats.notFound;
        
        const avgConfidence = this.stats.found > 0 
            ? Math.round(this.stats.totalConfidence / this.stats.found) 
            : 0;
        document.getElementById('stat-confidence').textContent = avgConfidence + '%';

        // Clear previous results
        resultsList.innerHTML = '';

        // Display each result
        this.results.forEach((result, index) => {
            const resultItem = this.createResultItem(result, index);
            resultsList.appendChild(resultItem);
        });
    }

    // Create result item HTML
    createResultItem(result, index) {
        const div = document.createElement('div');
        div.className = 'result-item';
        
        if (result.status === 'found') {
            const confidence = result.match.confidence;
            if (confidence >= 80) {
                div.classList.add('success');
            } else if (confidence >= 60) {
                div.classList.add('warning');
            } else {
                div.classList.add('error');
            }
        } else {
            div.classList.add('error');
        }

        if (result.status === 'found') {
            div.innerHTML = `
                <img src="${result.match.imageUrl || 'https://via.placeholder.com/80'}" 
                     alt="Album art" 
                     class="result-album-art"
                     onerror="this.src='https://via.placeholder.com/80?text=No+Image'">
                <div class="result-info">
                    <div class="result-title">${result.original.artist} - ${result.original.title}</div>
                    <div class="result-artist">
                        ✅ Gevonden: ${result.match.artist} - ${result.match.name}
                    </div>
                    <div class="result-meta">
                        Album: ${result.match.album} | 
                        Release: ${result.match.releaseDate} | 
                        ID: ${result.match.spotifyId}
                    </div>
                    ${result.match.previewUrl ? `
                        <audio controls style="margin-top: 10px; width: 100%;">
                            <source src="${result.match.previewUrl}" type="audio/mpeg">
                        </audio>
                    ` : ''}
                </div>
                <div class="result-actions">
                    <span class="confidence-badge ${
                        result.match.confidence >= 80 ? 'confidence-high' :
                        result.match.confidence >= 60 ? 'confidence-medium' : 'confidence-low'
                    }">
                        ${result.match.confidence}% match
                    </span>
                    <button onclick="lookupTool.changeMatch(${index})" style="background: #ffa500; color: white;">
                        🔄 Wijzig
                    </button>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div style="width: 80px; height: 80px; background: rgba(255,0,0,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2em;">
                    ❌
                </div>
                <div class="result-info">
                    <div class="result-title">${result.original.artist} - ${result.original.title}</div>
                    <div class="result-artist" style="color: #ff4444;">
                        ❌ Niet gevonden op Spotify
                    </div>
                    <div class="result-meta">
                        Jaar: ${result.original.year}
                    </div>
                </div>
                <div class="result-actions">
                    <button onclick="lookupTool.manualInput(${index})" style="background: #1db954; color: white;">
                        ✏️ Handmatig
                    </button>
                </div>
            `;
        }

        // Add manual input section
        const manualDiv = document.createElement('div');
        manualDiv.className = 'manual-input';
        manualDiv.id = `manual-${index}`;
        manualDiv.innerHTML = `
            <input type="text" 
                   id="manual-input-${index}" 
                   placeholder="Voer Spotify ID in (bijv: 4cOdK2wGLETKBW3PvgPWqT)">
            <button onclick="lookupTool.saveManualId(${index})" style="background: #1db954; color: white; padding: 8px 16px; border: none; border-radius: 5px;">
                💾 Save
            </button>
            <button onclick="lookupTool.cancelManualInput(${index})" style="background: #ff4444; color: white; padding: 8px 16px; border: none; border-radius: 5px;">
                ❌
            </button>
        `;
        
        div.appendChild(manualDiv);
        return div;
    }

    // Manual input for song ID
    manualInput(index) {
        const manualDiv = document.getElementById(`manual-${index}`);
        manualDiv.classList.add('active');
    }

    cancelManualInput(index) {
        const manualDiv = document.getElementById(`manual-${index}`);
        manualDiv.classList.remove('active');
    }

    async saveManualId(index) {
        const input = document.getElementById(`manual-input-${index}`);
        const spotifyId = input.value.trim();

        if (!spotifyId) {
            alert('Voer een geldig Spotify ID in!');
            return;
        }

        // Verify the ID exists
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/tracks/${spotifyId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${spotifyAuth.accessToken}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Invalid Spotify ID');
            }

            const track = await response.json();

            // Update result
            this.results[index] = {
                original: this.results[index].original,
                match: {
                    spotifyId: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    releaseDate: track.album.release_date,
                    imageUrl: track.album.images[0]?.url || '',
                    previewUrl: track.preview_url,
                    confidence: 100
                },
                status: 'found'
            };

            // Update stats
            if (this.results[index].status === 'notfound') {
                this.stats.notFound--;
                this.stats.found++;
            }

            // Refresh display
            this.displayResults();
        } catch (error) {
            alert('Ongeldige Spotify ID! Controleer of het ID correct is.');
        }
    }

    // Change match (search again or manual input)
    changeMatch(index) {
        this.manualInput(index);
    }

    // Get final results as JSON
    getFinalResults() {
        return this.results.map(result => ({
            artist: result.original.artist,
            title: result.original.title,
            year: result.original.year,
            spotifyId: result.match ? result.match.spotifyId : ''
        }));
    }

    // Save results to hitster-songs.js format
    async saveResults() {
        const finalResults = this.getFinalResults();
        
        // Ask for confirmation
        const confirmed = confirm(
            `🔄 Weet je het zeker?\n\n` +
            `Dit overschrijft het huidige hitster-songs.js bestand op de server!\n\n` +
            `Aantal nummers: ${finalResults.length}\n` +
            `Gevonden: ${this.stats.found}\n` +
            `Niet gevonden: ${this.stats.notFound}\n\n` +
            `Er wordt automatisch een backup gemaakt.`
        );
        
        if (!confirmed) {
            return;
        }

        // Show loading
        const originalText = event.target.textContent;
        event.target.textContent = '⏳ Opslaan...';
        event.target.disabled = true;

        try {
            // Secret key for basic security (you should change this!)
            const SECRET_KEY = 'hitster-admin-2024';
            
            const response = await fetch('update-songs.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    songs: finalResults,
                    secret: SECRET_KEY
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            // Success!
            alert(
                `✅ Succesvol opgeslagen!\n\n` +
                `${result.songCount} nummers bijgewerkt\n` +
                `Backup: ${result.backup}\n` +
                `Tijd: ${result.timestamp}\n\n` +
                `De pagina wordt nu herladen...`
            );

            // Reload the page to use the new songs
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);

        } catch (error) {
            alert(`❌ Fout bij opslaan:\n\n${error.message}\n\nProbeer het opnieuw of gebruik de Download knop.`);
            event.target.textContent = originalText;
            event.target.disabled = false;
        }
    }

    // Download as JSON
    downloadJSON() {
        const finalResults = this.getFinalResults();
        const blob = new Blob([JSON.stringify(finalResults, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hitster-songs-backup-' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Download as JS file
    downloadJS() {
        const finalResults = this.getFinalResults();
        const jsContent = `// Hitster Songs Database\n// Backup created: ${new Date().toISOString()}\nconst hitsterSongs = ${JSON.stringify(finalResults, null, 4)};\n`;
        
        const blob = new Blob([jsContent], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hitster-songs-backup-' + new Date().toISOString().split('T')[0] + '.js';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Copy to clipboard
    copyToClipboard() {
        const finalResults = this.getFinalResults();
        const text = JSON.stringify(finalResults, null, 4);
        
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ Gekopieerd naar clipboard!');
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('❌ Kopiëren mislukt. Probeer handmatig te selecteren en kopiëren.');
        });
    }
}

// Global instance
const lookupTool = new SpotifyIDLookup();

// Initialize when page loads
window.addEventListener('load', async () => {
    await lookupTool.initialize();
});

// UI Functions
async function startLookup() {
    const input = document.getElementById('json-input').value.trim();
    
    if (!input) {
        alert('⚠️ Plak eerst je JSON lijst!');
        return;
    }

    try {
        const songs = lookupTool.parseInput(input);
        
        if (!await lookupTool.initialize()) {
            alert('⚠️ Je moet eerst inloggen met Spotify!');
            return;
        }

        await lookupTool.processAllSongs(songs);
    } catch (error) {
        alert(`❌ Fout: ${error.message}`);
    }
}

function clearInput() {
    document.getElementById('json-input').value = '';
}

function loadExample() {
    const example = [
        {
            "artist": "ABBA",
            "title": "Dancing Queen",
            "year": 1976,
            "spotifyId": ""
        },
        {
            "artist": "Queen",
            "title": "Bohemian Rhapsody",
            "year": 1975,
            "spotifyId": ""
        },
        {
            "artist": "Michael Jackson",
            "title": "Billie Jean",
            "year": 1982,
            "spotifyId": ""
        }
    ];
    
    document.getElementById('json-input').value = JSON.stringify(example, null, 4);
}

function resetTool() {
    document.getElementById('json-input').value = '';
    document.getElementById('results-section').classList.remove('active');
    lookupTool.results = [];
    lookupTool.songs = [];
}

function saveResults() {
    lookupTool.saveResults();
}

function downloadJSON() {
    lookupTool.downloadJSON();
}

function downloadJS() {
    lookupTool.downloadJS();
}

function copyToClipboard() {
    lookupTool.copyToClipboard();
}
