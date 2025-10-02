// Quiz logic for Hitster Trainer
class HitsterQuiz {
    constructor() {
        this.currentSong = null;
        this.currentQuestion = 0;
        this.score = 0;
        this.totalQuestions = 10;
        this.questions = [];
        this.isPlaying = false;
        this.questionTypes = ['artist', 'year', 'title'];
        
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('play-btn').addEventListener('click', () => this.togglePlayback());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('restart-btn').addEventListener('click', () => this.startQuiz());
    }

    // Start a new quiz
    startQuiz() {
        this.currentQuestion = 0;
        this.score = 0;
        this.questions = this.generateQuestions();
        
        document.getElementById('final-score').classList.add('hidden');
        document.getElementById('quiz-section').classList.remove('hidden');
        
        this.showQuestion();
    }

    // Generate random questions for the quiz
    generateQuestions() {
        const questions = [];
        const usedSongs = new Set();
        
        for (let i = 0; i < this.totalQuestions; i++) {
            let song;
            do {
                song = hitsterSongs[Math.floor(Math.random() * hitsterSongs.length)];
            } while (usedSongs.has(song.spotifyId));
            
            usedSongs.add(song.spotifyId);
            
            const questionType = this.questionTypes[Math.floor(Math.random() * this.questionTypes.length)];
            
            questions.push({
                song: song,
                type: questionType,
                answers: this.generateAnswers(song, questionType)
            });
        }
        
        return questions;
    }

    // Generate multiple choice answers for a question
    generateAnswers(correctSong, questionType) {
        const answers = [];
        let correctAnswer;
        
        switch (questionType) {
            case 'artist':
                correctAnswer = correctSong.artist;
                break;
            case 'year':
                correctAnswer = correctSong.year.toString();
                break;
            case 'title':
                correctAnswer = correctSong.title;
                break;
        }
        
        answers.push({ text: correctAnswer, isCorrect: true });
        
        // Generate wrong answers
        const wrongAnswers = new Set();
        while (wrongAnswers.size < 3) {
            const randomSong = hitsterSongs[Math.floor(Math.random() * hitsterSongs.length)];
            let wrongAnswer;
            
            switch (questionType) {
                case 'artist':
                    wrongAnswer = randomSong.artist;
                    break;
                case 'year':
                    wrongAnswer = randomSong.year.toString();
                    break;
                case 'title':
                    wrongAnswer = randomSong.title;
                    break;
            }
            
            if (wrongAnswer !== correctAnswer) {
                wrongAnswers.add(wrongAnswer);
            }
        }
        
        // Add wrong answers
        wrongAnswers.forEach(answer => {
            answers.push({ text: answer, isCorrect: false });
        });
        
        // Shuffle answers
        return this.shuffleArray(answers);
    }

    // Utility function to shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Show current question
    async showQuestion() {
        const question = this.questions[this.currentQuestion];
        this.currentSong = question.song;
        
        // Update UI
        document.getElementById('question-number').textContent = this.currentQuestion + 1;
        document.getElementById('current-score').textContent = this.score;
        
        // Hide result section
        document.getElementById('result-section').classList.add('hidden');
        
        // Set question text
        let questionText;
        switch (question.type) {
            case 'artist':
                questionText = 'Welke artiest zingt dit nummer?';
                break;
            case 'year':
                questionText = 'Uit welk jaar komt dit nummer?';
                break;
            case 'title':
                questionText = 'Wat is de titel van dit nummer?';
                break;
        }
        
        document.getElementById('question-text').textContent = questionText;
        
        // Generate answer buttons
        const answersContainer = document.getElementById('answers');
        answersContainer.innerHTML = '';
        
        question.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer.text;
            button.addEventListener('click', () => this.selectAnswer(answer, button));
            answersContainer.appendChild(button);
        });
        
        // Reset play button
        this.isPlaying = false;
        this.updatePlayButton();
        
        // Auto-play the song if possible
        this.playCurrentSong();
    }

    // Select an answer
    selectAnswer(selectedAnswer, buttonElement) {
        const question = this.questions[this.currentQuestion];
        
        // Disable all buttons
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.classList.add('disabled');
            btn.style.pointerEvents = 'none';
        });
        
        // Highlight correct and incorrect answers
        answerButtons.forEach(btn => {
            const answer = question.answers.find(a => a.text === btn.textContent);
            if (answer.isCorrect) {
                btn.classList.add('correct');
            } else if (btn === buttonElement) {
                btn.classList.add('incorrect');
            }
        });
        
        // Update score
        if (selectedAnswer.isCorrect) {
            this.score++;
            document.getElementById('result-text').textContent = '🎉 Correct!';
            document.getElementById('result-text').style.color = '#1db954';
        } else {
            document.getElementById('result-text').textContent = '❌ Fout!';
            document.getElementById('result-text').style.color = '#e22134';
        }
        
        // Show correct answer info
        document.getElementById('correct-answer').textContent = 
            `${this.currentSong.artist} - "${this.currentSong.title}" (${this.currentSong.year})`;
        
        // Show result section
        document.getElementById('result-section').classList.remove('hidden');
        
        // Update score display
        document.getElementById('current-score').textContent = this.score;
    }

    // Move to next question or show final results
    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.totalQuestions) {
            this.showFinalResults();
        } else {
            this.showQuestion();
        }
    }

    // Show final results
    showFinalResults() {
        document.getElementById('quiz-section').classList.add('hidden');
        document.getElementById('final-score').classList.remove('hidden');
        
        const percentage = Math.round((this.score / this.totalQuestions) * 100);
        document.getElementById('final-score-text').textContent = `${this.score}`;
        
        // Stop playback
        if (window.spotifyAuth) {
            window.spotifyAuth.pausePlayback();
        }
        
        // Add some encouraging text based on score
        const finalScoreSection = document.getElementById('final-score');
        let encouragement = '';
        
        if (percentage >= 80) {
            encouragement = '🎵 Geweldig! Je bent een echte muziekkenner! 🎵';
        } else if (percentage >= 60) {
            encouragement = '🎶 Goed gedaan! Je kent je muziek! 🎶';
        } else if (percentage >= 40) {
            encouragement = '🎵 Niet slecht! Blijf oefenen! 🎵';
        } else {
            encouragement = '🎶 Tijd om meer muziek te ontdekken! 🎶';
        }
        
        // Check if encouragement element exists, if not create it
        let encouragementElement = finalScoreSection.querySelector('.encouragement');
        if (!encouragementElement) {
            encouragementElement = document.createElement('p');
            encouragementElement.className = 'encouragement';
            encouragementElement.style.marginTop = '20px';
            encouragementElement.style.fontSize = '18px';
            encouragementElement.style.color = '#1db954';
            finalScoreSection.insertBefore(encouragementElement, finalScoreSection.querySelector('#restart-btn'));
        }
        
        encouragementElement.textContent = encouragement;
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