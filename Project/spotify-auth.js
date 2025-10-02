// Spotify Authentication and API integration
class SpotifyAuth {
    constructor() {
        // You need to register your app at https://developer.spotify.com/dashboard
        // and replace this with your actual client ID
        this.clientId = '8f31b962554b4366b0a594175be737c6'; // Replace with actual Client ID
        this.redirectUri = 'https://your-domain.com/callback.html'; // Replace with your actual domain after deployment
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

    // Check if there's an access token in the URL hash
    checkForToken() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        if (params.has('access_token')) {
            this.accessToken = params.get('access_token');
            // Clean up URL
            window.location.hash = '';
            // Store token temporarily (in real app, use secure storage)
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

    // Start the Spotify OAuth flow
    login() {
        const authUrl = new URL('https://accounts.spotify.com/authorize');
        authUrl.searchParams.append('client_id', this.clientId);
        authUrl.searchParams.append('response_type', 'token');
        authUrl.searchParams.append('redirect_uri', this.redirectUri);
        authUrl.searchParams.append('scope', this.scopes);

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