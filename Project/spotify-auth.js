// Spotify Authentication and API integration
class SpotifyAuth {
    constructor() {
        // You need to register your app at https://developer.spotify.com/dashboard
        // and replace this with your actual client ID
        this.clientId = '8f31b962554b4366b0a594175be737c6'; // Replace with actual Client ID
        
        // Use window.location.origin to automatically get the correct URL
        // This prevents redirect URI mismatch errors
        this.redirectUri = window.location.origin + '/callback.html';
        
        // Debug: Log the redirect URI being used
        console.log('🔍 Spotify Redirect URI:', this.redirectUri);
        
        this.scopes = [
            'streaming',
            'user-read-email',
            'user-read-private',
            'user-read-playback-state',
            'user-modify-playback-state'
        ].join(' ');

        this.accessToken = null;
        this.player = null;
        this.deviceId = null;

        // Check for token in URL hash (after redirect)
        this.checkForToken();
    }

    // Generate random string for PKCE
    generateRandomString(length) {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    }

    // Generate code challenge for PKCE
    async generateCodeChallenge(codeVerifier) {
        const digest = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(codeVerifier)
        );
        
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    // Check if there's an authorization code or access token (after redirect)
    async checkForToken() {
        // Check for authorization code (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            console.log('🔐 Authorization code received, exchanging for token...');
            const codeVerifier = localStorage.getItem('code_verifier');
            
            if (codeVerifier) {
                await this.exchangeCodeForToken(code, codeVerifier);
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                localStorage.removeItem('code_verifier');
                return;
            }
        }
        
        // Check for access token in hash (legacy support)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        if (params.has('access_token')) {
            this.accessToken = params.get('access_token');
            window.location.hash = '';
            localStorage.setItem('spotify_access_token', this.accessToken);
            this.initializePlayer();
        } else {
            // Check if we have a stored token
            const storedToken = localStorage.getItem('spotify_access_token');
            if (storedToken) {
                this.accessToken = storedToken;
                this.initializePlayer();
            }
        }
    }

    // Exchange authorization code for access token
    async exchangeCodeForToken(code, codeVerifier) {
        const params = new URLSearchParams({
            client_id: this.clientId,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            code_verifier: codeVerifier
        });

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (!response.ok) {
                throw new Error('Token exchange failed');
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            localStorage.setItem('spotify_access_token', this.accessToken);
            
            // Store refresh token if provided
            if (data.refresh_token) {
                localStorage.setItem('spotify_refresh_token', data.refresh_token);
            }
            
            console.log('✅ Successfully authenticated with Spotify');
            this.initializePlayer();
        } catch (error) {
            console.error('❌ Error exchanging code for token:', error);
        }
    }

    // Start the Spotify OAuth flow with PKCE
    async login() {
        console.log('🔐 Using PKCE authorization flow');
        
        // Generate code verifier and challenge
        const codeVerifier = this.generateRandomString(64);
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);
        
        // Store code verifier for later
        localStorage.setItem('code_verifier', codeVerifier);
        
        const authUrl = new URL('https://accounts.spotify.com/authorize');
        authUrl.searchParams.append('client_id', this.clientId);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('redirect_uri', this.redirectUri);
        authUrl.searchParams.append('scope', this.scopes);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        authUrl.searchParams.append('code_challenge', codeChallenge);

        window.location.href = authUrl.toString();
    }

    // Logout and clear tokens
    logout() {
        this.accessToken = null;
        localStorage.removeItem('spotify_access_token');
        if (this.player) {
            this.player.disconnect();
        }
        this.player = null;
        this.deviceId = null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.accessToken !== null;
    }

    // Initialize Spotify Web Playback SDK
    async initializePlayer() {
        if (!this.accessToken) return;

        // Wait for Spotify SDK to load
        await this.waitForSpotifySDK();

        this.player = new Spotify.Player({
            name: 'Hitster Trainer',
            getOAuthToken: cb => { cb(this.accessToken); },
            volume: 0.5
        });

        // Error handling
        this.player.addListener('initialization_error', ({ message }) => {
            console.error('Failed to initialize:', message);
        });

        this.player.addListener('authentication_error', ({ message }) => {
            console.error('Failed to authenticate:', message);
            this.logout();
        });

        this.player.addListener('account_error', ({ message }) => {
            console.error('Failed to validate Spotify account:', message);
        });

        this.player.addListener('playback_error', ({ message }) => {
            console.error('Failed to perform playback:', message);
        });

        // Playback status updates
        this.player.addListener('player_state_changed', (state) => {
            console.log('Player state changed:', state);
        });

        // Ready
        this.player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            this.deviceId = device_id;
        });

        // Not Ready
        this.player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        // Connect to the player!
        this.player.connect();
    }

    // Wait for Spotify SDK to be available
    waitForSpotifySDK() {
        return new Promise((resolve) => {
            if (window.Spotify) {
                resolve();
            } else {
                window.onSpotifyWebPlaybackSDKReady = () => {
                    resolve();
                };
            }
        });
    }

    // Get user profile
    async getUserProfile() {
        if (!this.accessToken) return null;

        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.logout();
                }
                throw new Error('Failed to fetch user profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    // Play a track by Spotify ID
    async playTrack(trackId) {
        if (!this.accessToken || !this.deviceId) {
            console.error('Player not ready');
            return false;
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [`spotify:track:${trackId}`]
                })
            });

            if (!response.ok) {
                console.error('Failed to play track:', response.status);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error playing track:', error);
            return false;
        }
    }

    // Pause playback
    async pausePlayback() {
        if (!this.accessToken || !this.deviceId) return false;

        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${this.deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Error pausing playback:', error);
            return false;
        }
    }

    // Resume playback
    async resumePlayback() {
        if (!this.accessToken || !this.deviceId) return false;

        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Error resuming playback:', error);
            return false;
        }
    }

    // Get track info by ID
    async getTrackInfo(trackId) {
        if (!this.accessToken) return null;

        try {
            const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch track info');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching track info:', error);
            return null;
        }
    }
}

// Global instance
window.spotifyAuth = new SpotifyAuth();