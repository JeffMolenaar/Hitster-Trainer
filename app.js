// Main application logic
class HitsterApp {
    constructor() {
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    async setup() {
        // Bind authentication events
        document.getElementById('login-btn').addEventListener('click', () => this.login());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Check authentication status
        this.checkAuthStatus();

        // Update UI every few seconds to check for auth changes
        setInterval(() => this.updateAuthStatus(), 3000);
    }

    // Check current authentication status
    async checkAuthStatus() {
        if (window.spotifyAuth.isAuthenticated()) {
            await this.showMainApp();
        } else {
            this.showAuthSection();
        }
    }

    // Update authentication status
    async updateAuthStatus() {
        if (window.spotifyAuth.isAuthenticated() && document.getElementById('main-section').classList.contains('hidden')) {
            await this.showMainApp();
        } else if (!window.spotifyAuth.isAuthenticated() && document.getElementById('auth-section').classList.contains('hidden')) {
            this.showAuthSection();
        }
    }

    // Handle login
    login() {
        // Check if client ID is configured
        if (window.spotifyAuth.clientId === 'your_spotify_client_id_here') {
            this.showSetupInstructions();
            return;
        }

        document.getElementById('auth-status').innerHTML = 
            '<div class="loading"></div> Verbinden met Spotify...';
        
        window.spotifyAuth.login();
    }

    // Handle logout
    logout() {
        window.spotifyAuth.logout();
        this.showAuthSection();
    }

    // Show authentication section
    showAuthSection() {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('main-section').classList.add('hidden');
        document.getElementById('auth-status').innerHTML = '';
    }

    // Show main application
    async showMainApp() {
        try {
            // Get user profile
            const profile = await window.spotifyAuth.getUserProfile();
            
            if (profile) {
                // Update user info
                document.getElementById('user-info').textContent = 
                    `Welkom, ${profile.display_name || profile.id}!`;
                
                // Hide auth section and show main app
                document.getElementById('auth-section').classList.add('hidden');
                document.getElementById('main-section').classList.remove('hidden');
                
                // Start the quiz if not already started
                if (window.hitsterQuiz.currentQuestion === 0 && window.hitsterQuiz.questions.length === 0) {
                    window.hitsterQuiz.startQuiz();
                }
            } else {
                throw new Error('Failed to get user profile');
            }
        } catch (error) {
            console.error('Error showing main app:', error);
            document.getElementById('auth-status').innerHTML = 
                '<p style="color: #e22134;">❌ Fout bij het verbinden met Spotify. Probeer opnieuw.</p>';
        }
    }

    // Show setup instructions for developers
    showSetupInstructions() {
        const instructions = `
            <div style="text-align: left; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h3 style="color: #1db954; margin-bottom: 15px;">🔧 Setup Required</h3>
                <p style="margin-bottom: 15px;">Om deze applicatie te gebruiken, moet je eerst een Spotify app registreren:</p>
                
                <ol style="margin-bottom: 15px; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Ga naar <a href="https://developer.spotify.com/dashboard" target="_blank" style="color: #1db954;">Spotify Developer Dashboard</a></li>
                    <li style="margin-bottom: 8px;">Maak een nieuwe app aan</li>
                    <li style="margin-bottom: 8px;">Voeg de redirect URI toe: <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">${window.location.origin}/callback.html</code></li>
                    <li style="margin-bottom: 8px;">Kopieer de Client ID</li>
                    <li style="margin-bottom: 8px;">Vervang 'your_spotify_client_id_here' in <code>spotify-auth.js</code> met je Client ID</li>
                    <li>Maak het bestand <code>callback.html</code> aan (zie instructies hieronder)</li>
                </ol>
                
                <p style="margin-bottom: 10px;">Voor meer informatie, zie de README.md</p>
                
                <button onclick="document.getElementById('auth-status').innerHTML=''" style="background: #535353; color: white; border: none; padding: 8px 16px; border-radius: 5px; margin-top: 10px;">Sluiten</button>
            </div>
        `;
        
        document.getElementById('auth-status').innerHTML = instructions;
    }

    // Show error message
    showError(message) {
        document.getElementById('auth-status').innerHTML = 
            `<p style="color: #e22134;">❌ ${message}</p>`;
    }

    // Show success message
    showSuccess(message) {
        document.getElementById('auth-status').innerHTML = 
            `<p style="color: #1db954;">✅ ${message}</p>`;
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.hitsterApp = new HitsterApp();
});