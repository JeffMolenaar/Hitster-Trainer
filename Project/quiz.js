// Quiz logic for Hitster Trainer - 3-Step Question System
class HitsterQuiz {
    constructor() {
        this.gameMode = 'medium'; // 'easy', 'medium', 'hard'
        this.currentSongIndex = 0;
        this.currentStep = 1; // 1 = artist, 2 = title, 3 = year
        this.score = 0;
        this.songsInQuiz = [];
        this.currentSong = null;
        this.isPlaying = false;
        
        // Statistics
        this.stats = {
            artistsCorrect: 0,
            titlesCorrect: 0,
            yearsCorrect: 0
        };
        
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('play-btn').addEventListener('click', () => this.togglePlayback());
        document.getElementById('next-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        document.getElementById('new-mode-btn').addEventListener('click', () => this.backToModeSelection());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.backToModeSelection());
    }

    // Get number of songs based on game mode
    getSongsCount() {
        const counts = {
            'easy': 5,
            'medium': 10,
            'hard': 15
        };
        return counts[this.gameMode] || 10;
    }

    // Start a new quiz with selected mode
    startQuiz(mode = 'medium') {
        this.gameMode = mode;
        this.currentSongIndex = 0;
        this.currentStep = 1;
        this.score = 0;
        this.stats = {
            artistsCorrect: 0,
            titlesCorrect: 0,
            yearsCorrect: 0
        };
        
        // Generate random songs for this quiz
        this.songsInQuiz = this.generateSongList();
        
        // Show quiz section
        document.getElementById('final-score').classList.add('hidden');
        document.getElementById('quiz-section').classList.remove('hidden');
        
        // Load first song
        this.loadSong();
    }

    // Restart quiz with same mode
    restartQuiz() {
        this.startQuiz(this.gameMode);
    }

    // Go back to mode selection
    backToModeSelection() {
        document.getElementById('main-section').classList.add('hidden');
        document.getElementById('mode-selection').classList.remove('hidden');
        
        // Stop any playing music
        if (window.spotifyAuth) {
            window.spotifyAuth.pausePlayback();
        }
    }

    // Generate random song list for quiz
    generateSongList() {
        const count = this.getSongsCount();
        const songs = [];
        const usedIndices = new Set();
        
        while (songs.length < count) {
            const randomIndex = Math.floor(Math.random() * hitsterSongs.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                songs.push(hitsterSongs[randomIndex]);
            }
        }
        
        return songs;
    }

    // Load current song and show first question
    loadSong() {
        this.currentSong = this.songsInQuiz[this.currentSongIndex];
        this.currentStep = 1;
        
        // Update progress indicators
        this.updateProgressUI();
        
        // Show question
        this.showQuestion();
        
        // Reset and play song
        this.isPlaying = false;
        this.updatePlayButton();
        this.playCurrentSong();
    }

    // Update progress UI
    updateProgressUI() {
        const totalSongs = this.getSongsCount();
        const maxScore = totalSongs * 3;
        
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('song-number').textContent = `${this.currentSongIndex + 1}/${totalSongs}`;
        document.getElementById('question-step').textContent = `${this.currentStep}/3`;
    }

    // Show current question based on step
    showQuestion() {
        // Hide result section
        document.getElementById('result-section').classList.add('hidden');
        
        // Set question text based on step
        let questionText = '';
        let questionType = '';
        
        switch (this.currentStep) {
            case 1:
                questionText = '🎤 Wie is de artiest?';
                questionType = 'artist';
                break;
            case 2:
                questionText = '🎵 Wat is de titel?';
                questionType = 'title';
                break;
            case 3:
                questionText = '📅 Uit welk jaar?';
                questionType = 'year';
                break;
        }
        
        document.getElementById('question-text').textContent = questionText;
        
        // Generate answer options
        const answers = this.generateAnswers(questionType);
        
        // Render answer buttons
        const answersContainer = document.getElementById('answers');
        answersContainer.innerHTML = '';
        
        answers.forEach((answer) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer.text;
            button.addEventListener('click', () => this.selectAnswer(answer, questionType));
            answersContainer.appendChild(button);
        });
    }

    // Generate answer options for current question
    generateAnswers(questionType) {
        const answers = [];
        let correctAnswer;
        
        // Get correct answer
        switch (questionType) {
            case 'artist':
                correctAnswer = this.currentSong.artist;
                break;
            case 'title':
                correctAnswer = this.currentSong.title;
                break;
            case 'year':
                correctAnswer = this.currentSong.year.toString();
                break;
        }
        
        // Add correct answer
        answers.push({ text: correctAnswer, isCorrect: true });
        
        // Generate 3 wrong answers
        const wrongAnswers = new Set();
        let attempts = 0;
        const maxAttempts = 100;
        
        while (wrongAnswers.size < 3 && attempts < maxAttempts) {
            attempts++;
            const randomSong = hitsterSongs[Math.floor(Math.random() * hitsterSongs.length)];
            let wrongAnswer;
            
            switch (questionType) {
                case 'artist':
                    wrongAnswer = randomSong.artist;
                    break;
                case 'title':
                    wrongAnswer = randomSong.title;
                    break;
                case 'year':
                    wrongAnswer = randomSong.year.toString();
                    break;
            }
            
            // Make sure it's different from correct answer and not duplicate
            if (wrongAnswer !== correctAnswer && !wrongAnswers.has(wrongAnswer)) {
                wrongAnswers.add(wrongAnswer);
                answers.push({ text: wrongAnswer, isCorrect: false });
            }
        }
        
        // Shuffle answers
        return this.shuffleArray(answers);
    }

    // Shuffle array utility
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Handle answer selection
    selectAnswer(selectedAnswer, questionType) {
        // Disable all buttons
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
            
            // Highlight correct answer
            if (btn.textContent === this.getCorrectAnswerText(questionType)) {
                btn.classList.add('correct');
            } else if (btn.textContent === selectedAnswer.text && !selectedAnswer.isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        // Update score and stats
        if (selectedAnswer.isCorrect) {
            this.score++;
            
            // Update stats
            switch (questionType) {
                case 'artist':
                    this.stats.artistsCorrect++;
                    break;
                case 'title':
                    this.stats.titlesCorrect++;
                    break;
                case 'year':
                    this.stats.yearsCorrect++;
                    break;
            }
            
            document.getElementById('result-text').textContent = '✅ Correct!';
            document.getElementById('result-text').style.color = '#1db954';
        } else {
            document.getElementById('result-text').textContent = '❌ Fout!';
            document.getElementById('result-text').style.color = '#e22134';
        }
        
        // Show result detail
        let resultDetail = '';
        switch (questionType) {
            case 'artist':
                resultDetail = `Artiest: ${this.currentSong.artist}`;
                break;
            case 'title':
                resultDetail = `Titel: ${this.currentSong.title}`;
                break;
            case 'year':
                resultDetail = `Jaar: ${this.currentSong.year}`;
                break;
        }
        document.getElementById('result-detail').textContent = resultDetail;
        
        // Update score display
        this.updateProgressUI();
        
        // Show result section
        document.getElementById('result-section').classList.remove('hidden');
        
        // Update next button text
        const nextBtn = document.getElementById('next-btn');
        if (this.currentStep < 3) {
            nextBtn.textContent = 'Volgende vraag';
        } else if (this.currentSongIndex < this.getSongsCount() - 1) {
            nextBtn.textContent = 'Volgend nummer';
        } else {
            nextBtn.textContent = 'Toon resultaten';
        }
    }

    // Get correct answer text for question type
    getCorrectAnswerText(questionType) {
        switch (questionType) {
            case 'artist':
                return this.currentSong.artist;
            case 'title':
                return this.currentSong.title;
            case 'year':
                return this.currentSong.year.toString();
        }
    }

    // Move to next step or song
    nextStep() {
        if (this.currentStep < 3) {
            // Next question for same song
            this.currentStep++;
            this.showQuestion();
        } else if (this.currentSongIndex < this.getSongsCount() - 1) {
            // Next song
            this.currentSongIndex++;
            this.loadSong();
        } else {
            // Quiz finished
            this.showFinalResults();
        }
    }

    // Show final results
    showFinalResults() {
        document.getElementById('quiz-section').classList.add('hidden');
        document.getElementById('final-score').classList.remove('hidden');
        
        // Stop playback
        if (window.spotifyAuth) {
            window.spotifyAuth.pausePlayback();
        }
        
        const maxScore = this.getSongsCount() * 3;
        const percentage = Math.round((this.score / maxScore) * 100);
        
        // Update stats display
        document.getElementById('final-score-text').textContent = `${this.score}/${maxScore}`;
        document.getElementById('artists-correct').textContent = `${this.stats.artistsCorrect}/${this.getSongsCount()}`;
        document.getElementById('titles-correct').textContent = `${this.stats.titlesCorrect}/${this.getSongsCount()}`;
        document.getElementById('years-correct').textContent = `${this.stats.yearsCorrect}/${this.getSongsCount()}`;
        
        // Encouragement message
        let encouragement = '';
        if (percentage >= 90) {
            encouragement = '� Perfect! Je bent een échte Hitster legende! �';
        } else if (percentage >= 75) {
            encouragement = '� Geweldig! Je bent een muziekkenner! �';
        } else if (percentage >= 60) {
            encouragement = '🎵 Goed gedaan! Je kent je muziek! �';
        } else if (percentage >= 40) {
            encouragement = '🎶 Niet slecht! Blijf oefenen! 🎶';
        } else {
            encouragement = '💪 Nog veel te leren! Probeer het nog eens! 💪';
        }
        
        document.getElementById('encouragement-text').textContent = encouragement;
    }

    // Play current song
    async playCurrentSong() {
        if (!this.currentSong || !window.spotifyAuth.isAuthenticated()) {
            console.log('Cannot play: no song selected or not authenticated');
            return;
        }
        
        try {
            const success = await window.spotifyAuth.playTrack(this.currentSong.spotifyId);
            if (success) {
                this.isPlaying = true;
                this.updatePlayButton();
            }
        } catch (error) {
            console.error('Failed to play song:', error);
        }
    }

    // Toggle playback
    async togglePlayback() {
        if (!window.spotifyAuth.isAuthenticated()) {
            alert('Spotify is niet verbonden. Log eerst in.');
            return;
        }
        
        if (!this.currentSong) {
            alert('Geen nummer geladen.');
            return;
        }
        
        try {
            if (this.isPlaying) {
                await window.spotifyAuth.pausePlayback();
                this.isPlaying = false;
            } else {
                await this.playCurrentSong();
            }
            
            this.updatePlayButton();
        } catch (error) {
            console.error('Failed to toggle playback:', error);
        }
    }

    // Update play button text
    updatePlayButton() {
        const playBtn = document.getElementById('play-btn');
        if (this.isPlaying) {
            playBtn.textContent = '⏸️ Pauzeer';
            playBtn.classList.remove('btn-primary');
            playBtn.classList.add('btn-secondary');
        } else {
            playBtn.textContent = '▶️ Speel af';
            playBtn.classList.remove('btn-secondary');
            playBtn.classList.add('btn-primary');
        }
    }
}

// Global quiz instance
window.hitsterQuiz = new HitsterQuiz();