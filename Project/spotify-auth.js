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

        // Detect if mobile device
        this.isMobile = this.detectMobile();
        console.log('📱 Mobile device detected:', this.isMobile);

        // HTML5 audio player for mobile (using preview URLs)
        this.audioPlayer = null;
        this.currentPreviewUrl = null;

        if (this.isMobile) {
            this.initializeAudioPlayer();
        }

        // Check for token in URL hash (after redirect)
        this.checkForToken();
    }

    // Detect mobile device
    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Check for mobile patterns
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
        const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
        
        // Also check for touch support
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Check screen width (mobile typically < 768px)
        const isSmallScreen = window.innerWidth < 768;
        
        return isMobileUA || (isTouchDevice && isSmallScreen);
    }

    // Initialize HTML5 audio player for mobile
    initializeAudioPlayer() {
        if (!this.audioPlayer) {
            this.audioPlayer = new Audio();
            this.audioPlayer.preload = 'metadata';
            
            // Event listeners
            this.audioPlayer.addEventListener('ended', () => {
                console.log('🎵 Audio preview ended');
            });
            
            this.audioPlayer.addEventListener('error', (e) => {
                console.error('🚫 Audio playback error:', e);
            });
            
            this.audioPlayer.addEventListener('loadedmetadata', () => {
                console.log('✅ Audio preview loaded');
            });
            
            console.log('🎵 HTML5 Audio player initialized for mobile');
        }
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
            
            // Only initialize Web Playback SDK on desktop
            if (!this.isMobile) {
                this.initializePlayer();
            } else {
                console.log('📱 Mobile device - using preview URLs instead of SDK');
            }
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
        
        // Skip SDK initialization on mobile
        if (this.isMobile) {
            console.log('📱 Skipping Spotify SDK on mobile - using preview URLs');
            return;
        }

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
    async playTrack(trackId, previewUrl = null) {
        // MOBILE: Use preview URL with HTML5 audio
        if (this.isMobile) {
            console.log('📱 [MOBILE PLAYBACK] Using preview URL for track:', trackId);
            console.log('   Audio player ready:', !!this.audioPlayer);
            console.log('   Preview URL provided:', previewUrl ? 'Yes' : 'No, will fetch');
            
            try {
                // Use provided preview URL or fetch from API
                if (previewUrl) {
                    console.log('✅ [MOBILE PLAYBACK] Using provided preview URL from song data');
                    this.currentPreviewUrl = previewUrl;
                } else {
                    // Fallback: Get track info to retrieve preview URL
                    console.log('🔍 [MOBILE PLAYBACK] No preview URL provided, fetching track info...');
                    const trackInfo = await this.getTrackInfo(trackId);
                    
                    if (!trackInfo) {
                        console.error('🚫 [MOBILE PLAYBACK] Failed to get track info');
                        return { success: false, reason: 'TRACK_INFO_FAILED' };
                    }
                    
                    console.log(`✅ [MOBILE PLAYBACK] Got track: "${trackInfo.name}" by ${trackInfo.artists.map(a => a.name).join(', ')}`);
                    console.log('   Preview URL:', trackInfo.preview_url ? 'Available' : 'NOT AVAILABLE');
                    
                    if (!trackInfo.preview_url) {
                        console.warn('⚠️ [MOBILE PLAYBACK] No preview URL available for this track');
                        console.warn(`   Track: "${trackInfo.name}" by ${trackInfo.artists.map(a => a.name).join(', ')}`);
                        return { success: false, reason: 'NO_PREVIEW_URL' };
                    }
                    
                    this.currentPreviewUrl = trackInfo.preview_url;
                }
                
                console.log('🎵 [MOBILE PLAYBACK] Preview URL ready, preparing audio player...');
                console.log('   URL:', this.currentPreviewUrl);
                
                if (this.audioPlayer) {
                    this.audioPlayer.src = this.currentPreviewUrl;
                    this.audioPlayer.currentTime = 0;
                    
                    // Wait for metadata to load
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error('Timeout loading audio'));
                        }, 5000);
                        
                        const onLoad = () => {
                            clearTimeout(timeout);
                            this.audioPlayer.removeEventListener('loadedmetadata', onLoad);
                            this.audioPlayer.removeEventListener('error', onError);
                            resolve();
                        };
                        
                        const onError = (e) => {
                            clearTimeout(timeout);
                            this.audioPlayer.removeEventListener('loadedmetadata', onLoad);
                            this.audioPlayer.removeEventListener('error', onError);
                            reject(e);
                        };
                        
                        this.audioPlayer.addEventListener('loadedmetadata', onLoad);
                        this.audioPlayer.addEventListener('error', onError);
                        
                        // If already loaded, resolve immediately
                        if (this.audioPlayer.readyState >= 1) {
                            onLoad();
                        }
                    });
                    
                    console.log('📊 [MOBILE PLAYBACK] Audio metadata loaded, readyState:', this.audioPlayer.readyState);
                    
                    try {
                        await this.audioPlayer.play();
                        console.log('✅ [MOBILE PLAYBACK] Playing preview:', trackInfo.name);
                        return { success: true, isMobilePreview: true };
                    } catch (playError) {
                        console.error('🚫 [MOBILE PLAYBACK] Play failed:', playError);
                        return { success: false, reason: 'AUDIO_PLAY_FAILED', error: playError.message };
                    }
                } else {
                    console.error('🚫 [MOBILE PLAYBACK] Audio player not initialized');
                    return { success: false, reason: 'AUDIO_PLAYER_NOT_READY' };
                }
                
            } catch (error) {
                console.error('💥 [MOBILE PLAYBACK] Exception:', error);
                return { success: false, reason: 'MOBILE_PLAYBACK_ERROR', error: error.message };
            }
        }
        
        // DESKTOP: Use Spotify Web Playback SDK
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
        // MOBILE: Pause HTML5 audio
        if (this.isMobile) {
            if (this.audioPlayer) {
                this.audioPlayer.pause();
                console.log('⏸️ [MOBILE PLAYBACK] Paused');
                return true;
            }
            return false;
        }
        
        // DESKTOP: Pause via Spotify API
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
        // MOBILE: Resume HTML5 audio
        if (this.isMobile) {
            if (this.audioPlayer && this.currentPreviewUrl) {
                try {
                    await this.audioPlayer.play();
                    console.log('▶️ [MOBILE PLAYBACK] Resumed');
                    return true;
                } catch (error) {
                    console.error('🚫 [MOBILE PLAYBACK] Resume failed:', error);
                    return false;
                }
            }
            return false;
        }
        
        // DESKTOP: Resume via Spotify API
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
        // MOBILE: Wait for preview to load and verify playback
        if (this.isMobile) {
            console.log('🔍 [MOBILE VERIFY] Checking preview playback for:', songTitle);
            
            // Wait a bit for audio to start loading
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (!this.audioPlayer || !this.currentPreviewUrl) {
                console.warn('⚠️ [MOBILE VERIFY] No audio player or preview URL');
                return {
                    success: false,
                    reason: 'NO_AUDIO_PLAYER',
                    message: 'Geen audio player beschikbaar'
                };
            }
            
            // Check if audio is ready
            const readyState = this.audioPlayer.readyState;
            console.log(`📊 [MOBILE VERIFY] Audio readyState: ${readyState} (0=none, 1=metadata, 2=current, 3=future, 4=enough)`);
            
            // Check if playing or loading
            if (!this.audioPlayer.paused || readyState >= 2) {
                console.log('✅ [MOBILE VERIFY] Preview playing or ready:', songTitle);
                return {
                    success: true,
                    reason: 'MOBILE_PREVIEW',
                    message: 'Preview URL speelt af'
                };
            } else if (this.audioPlayer.error) {
                console.error('🚫 [MOBILE VERIFY] Audio error:', this.audioPlayer.error);
                return {
                    success: false,
                    reason: 'AUDIO_ERROR',
                    message: `Audio fout: ${this.audioPlayer.error.message}`
                };
            } else {
                console.warn('⚠️ [MOBILE VERIFY] Preview paused or not ready');
                console.warn(`   paused: ${this.audioPlayer.paused}, readyState: ${readyState}`);
                
                // Give it another chance - wait a bit more
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (!this.audioPlayer.paused || this.audioPlayer.readyState >= 2) {
                    console.log('✅ [MOBILE VERIFY] Preview ready after retry');
                    return {
                        success: true,
                        reason: 'MOBILE_PREVIEW',
                        message: 'Preview URL speelt af'
                    };
                }
                
                return {
                    success: false,
                    reason: 'MOBILE_NOT_PLAYING',
                    message: 'Preview speelt niet af'
                };
            }
        }
        
        // DESKTOP: Full verification via Spotify API
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