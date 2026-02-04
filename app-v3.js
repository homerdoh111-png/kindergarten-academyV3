/**
 * Kindergarten Academy V3 - Main App Controller
 * Clean, tested, working
 */

const App = {
    // State
    state: {
        username: '',
        currentScreen: 'loading',
        stars: 0,
        buddyInstance: null
    },

    // Initialize app
    init() {
        console.log('🚀 Kindergarten Academy V3 Starting...');
        
        // Wait for everything to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onReady());
        } else {
            this.onReady();
        }
    },

    // When DOM is ready
    onReady() {
        console.log('✅ DOM Ready');
        
        // Initialize 3D environment
        setTimeout(() => {
            if (typeof TreehouseScene !== 'undefined') {
                TreehouseScene.init();
                console.log('🌳 Treehouse initialized');
            }
        }, 100);

        // Show login after environment loads
        setTimeout(() => {
            this.showScreen('loginScreen');
        }, 2000);

        // Set up event listeners
        this.setupEventListeners();
    },

    // Setup all event listeners
    setupEventListeners() {
        // Login
        const loginBtn = document.getElementById('loginBtn');
        const usernameInput = document.getElementById('usernameInput');
        
        if (loginBtn && usernameInput) {
            loginBtn.addEventListener('click', () => this.handleLogin());
            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        }

        // Activity buttons
        document.querySelectorAll('.activity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const activity = btn.dataset.activity;
                if (activity) {
                    this.startActivity(activity);
                }
            });
        });

        // Back button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showScreen('treehouseScreen');
                this.updateSpeechBubble('What should we learn next? 🤔');
            });
        }

        // Voice button
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.handleVoice());
        }

        // Joke button
        const jokeBtn = document.getElementById('jokeBtn');
        if (jokeBtn) {
            jokeBtn.addEventListener('click', () => this.handleJoke());
        }
    },

    // Handle login
    handleLogin() {
        const input = document.getElementById('usernameInput');
        const username = input.value.trim();

        if (!username) {
            input.style.borderColor = '#E63946';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 1000);
            return;
        }

        this.state.username = username;
        
        // Initialize Buddy
        if (typeof Buddy3D !== 'undefined') {
            this.state.buddyInstance = Buddy3D.init('buddy-3d');
            console.log('🐻 Buddy initialized');
        }

        // Show main screen
        this.showScreen('treehouseScreen');
        this.updateSpeechBubble(`Hi ${username}! Ready to learn? 🎉`);
    },

    // Show a screen
    showScreen(screenId) {
        console.log('Showing screen:', screenId);
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.state.currentScreen = screenId;
        }
    },

    // Start an activity
    startActivity(activityName) {
        console.log('Starting activity:', activityName);
        
        if (typeof Activities === 'undefined') {
            console.error('Activities module not loaded');
            return;
        }

        // Show activity screen
        this.showScreen('activityScreen');
        
        // Load the activity
        Activities.load(activityName, {
            onCorrect: () => this.onCorrectAnswer(),
            onWrong: () => this.onWrongAnswer(),
            updateScore: (score) => this.updateScore(score)
        });

        // Update Buddy
        this.updateSpeechBubble('You can do it! 💪');
    },

    // Handle correct answer
    onCorrectAnswer() {
        this.state.stars++;
        this.updateStarCount();
        this.updateSpeechBubble(['Awesome! ⭐', 'Great job! 🎉', 'Perfect! 🌟'][Math.floor(Math.random() * 3)]);
        
        if (this.state.buddyInstance && this.state.buddyInstance.celebrate) {
            this.state.buddyInstance.celebrate();
        }
    },

    // Handle wrong answer
    onWrongAnswer() {
        this.updateSpeechBubble(['Try again! 💪', 'You can do it! 🤔', 'Keep going! 😊'][Math.floor(Math.random() * 3)]);
    },

    // Update star count
    updateStarCount() {
        const starElement = document.getElementById('starCount');
        if (starElement) {
            starElement.textContent = this.state.stars;
        }

        const activityScore = document.getElementById('activityScore');
        if (activityScore) {
            activityScore.textContent = this.state.stars;
        }
    },

    // Update score
    updateScore(score) {
        this.state.stars = score;
        this.updateStarCount();
    },

    // Update speech bubble
    updateSpeechBubble(text) {
        const bubble = document.getElementById('speechBubble');
        if (bubble) {
            bubble.textContent = text;
            
            // Animate
            bubble.style.animation = 'none';
            setTimeout(() => {
                bubble.style.animation = '';
            }, 10);
        }

        if (this.state.buddyInstance && this.state.buddyInstance.talk) {
            this.state.buddyInstance.talk(text);
        }
    },

    // Handle voice recording
    handleVoice() {
        if (typeof BuddyVoice === 'undefined') {
            this.updateSpeechBubble('Voice not supported! 😔');
            return;
        }

        if (!BuddyVoice.isSupported()) {
            this.updateSpeechBubble('Microphone not available! 🎤');
            return;
        }

        const voiceBtn = document.getElementById('voiceBtn');
        
        if (BuddyVoice.isRecording()) {
            // Stop recording
            BuddyVoice.stopRecording();
            voiceBtn.textContent = '🎤';
            this.updateSpeechBubble('Hehe! Did you hear that? 😄');
        } else {
            // Start recording
            BuddyVoice.startRecording().then(success => {
                if (success) {
                    voiceBtn.textContent = '🔴';
                    this.updateSpeechBubble('Talk to me! I\'m listening! 🎤');
                } else {
                    this.updateSpeechBubble('Can\'t access microphone! 😔');
                }
            });
        }
    },

    // Handle joke telling
    handleJoke() {
        if (typeof BuddyVoice === 'undefined') {
            this.updateSpeechBubble('Jokes not available! 😔');
            return;
        }

        const joke = BuddyVoice.tellJoke();
        
        // Show setup
        this.updateSpeechBubble(joke.setup);
        
        // Show punchline after delay
        setTimeout(() => {
            this.updateSpeechBubble(joke.punchline + ' 😂');
            
            // Speak if available
            if (BuddyVoice.speak) {
                setTimeout(() => {
                    BuddyVoice.speak(joke.punchline);
                }, 500);
            }
        }, 3000);
    }
};

// Initialize when script loads
App.init();
