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

    // Check if there's a stored access token (after redirect from callback)
    async checkForToken() {
        // Check if we have a stored token
        const storedToken = localStorage.getItem('spotify_access_token');
        if (storedToken) {
            this.accessToken = storedToken;
            console.log('✅ Found stored access token');
            this.initializePlayer();
        }
    }

    // Start the Spotify OAuth flow with PKCE
    async login() {
        console.log('🔐 Using PKCE authorization flow');

        // Generate code verifier and challenge
        const codeVerifier = this.generateRandomString(64);
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);

        // Store code verifier for later (callback.html will use this)
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
            console.error('🚫 [PLAY TRACK] Player not ready');
            return { success: false, reason: 'PLAYER_NOT_READY' };
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
                const errorBody = await response.text();
                console.error(`🚫 [PLAY TRACK] Failed (${response.status}):`, errorBody);
                
                // Parse specific errors
                if (response.status === 404) {
                    return { success: false, reason: 'TRACK_NOT_FOUND' };
                } else if (response.status === 403) {
                    return { success: false, reason: 'PREMIUM_REQUIRED' };
                } else if (response.status === 502 || response.status === 503) {
                    return { success: false, reason: 'SPOTIFY_UNAVAILABLE' };
                }
                
                return { success: false, reason: 'PLAYBACK_FAILED', status: response.status };
            }

            return { success: true };
        } catch (error) {
            console.error('💥 [PLAY TRACK] Exception:', error);
            return { success: false, reason: 'NETWORK_ERROR', error: error.message };
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

    // Verify that the correct track is playing
    async verifyPlayback(expectedTrackId, songTitle) {
        if (!this.accessToken) {
            return {
                success: false,
                reason: 'NOT_AUTHENTICATED',
                message: 'Niet geauthenticeerd bij Spotify'
            };
        }

        try {
            // Wait a bit for playback to start
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await fetch('https://api.spotify.com/v1/me/player', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (response.status === 204) {
                // No active playback
                console.warn(`🚫 [PLAYBACK VERIFY] No active playback for "${songTitle}" (ID: ${expectedTrackId})`);
                return {
                    success: false,
                    reason: 'NO_ACTIVE_DEVICE',
                    message: 'Geen actief Spotify apparaat gevonden'
                };
            }

            if (!response.ok) {
                if (response.status === 403) {
                    console.error(`🚫 [PLAYBACK VERIFY] Premium required for "${songTitle}" (ID: ${expectedTrackId})`);
                    return {
                        success: false,
                        reason: 'PREMIUM_REQUIRED',
                        message: 'Spotify Premium vereist'
                    };
                }
                console.error(`🚫 [PLAYBACK VERIFY] API error ${response.status} for "${songTitle}"`);
                return {
                    success: false,
                    reason: 'API_ERROR',
                    message: `Spotify API fout: ${response.status}`
                };
            }

            const playbackState = await response.json();

            // Check if playback is active
            if (!playbackState.is_playing) {
                console.warn(`⏸️ [PLAYBACK VERIFY] Playback not started for "${songTitle}" (ID: ${expectedTrackId})`);
                return {
                    success: false,
                    reason: 'NOT_PLAYING',
                    message: 'Playback niet gestart'
                };
            }

            // Check if correct track is playing
            const currentTrackId = playbackState.item?.id;
            if (!currentTrackId) {
                console.warn(`❓ [PLAYBACK VERIFY] No track info available for "${songTitle}"`);
                return {
                    success: false,
                    reason: 'NO_TRACK_INFO',
                    message: 'Geen track informatie beschikbaar'
                };
            }

            if (currentTrackId !== expectedTrackId) {
                console.error(`❌ [PLAYBACK VERIFY] Wrong track playing!`);
                console.error(`   Expected: "${songTitle}" (${expectedTrackId})`);
                console.error(`   Got: "${playbackState.item.name}" by ${playbackState.item.artists.map(a => a.name).join(', ')} (${currentTrackId})`);
                return {
                    success: false,
                    reason: 'WRONG_TRACK',
                    message: 'Verkeerd nummer wordt afgespeeld',
                    actualTrack: playbackState.item.name
                };
            }

            // Check if track is available
            if (playbackState.item.is_local) {
                console.warn(`📁 [PLAYBACK VERIFY] Track "${songTitle}" is a local file`);
                return {
                    success: false,
                    reason: 'LOCAL_FILE',
                    message: 'Lokaal bestand, niet beschikbaar'
                };
            }

            // All checks passed!
            console.log(`✅ [PLAYBACK VERIFY] Successfully playing "${songTitle}" (${expectedTrackId})`);
            return {
                success: true,
                reason: 'SUCCESS',
                message: 'Nummer speelt correct af'
            };

        } catch (error) {
            console.error(`💥 [PLAYBACK VERIFY] Exception for "${songTitle}":`, error);
            return {
                success: false,
                reason: 'NETWORK_ERROR',
                message: `Netwerkfout: ${error.message}`
            };
        }
    }
}

// Global instance
window.spotifyAuth = new SpotifyAuth();