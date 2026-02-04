/**
 * Kindergarten Academy V3 - Main App Controller
 * With proper Supabase authentication
 */

// Supabase Configuration
const SUPABASE_URL = 'https://tybeiukfsuzwdvjwavtp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YmVpdWtmc3V6d2R2andhdnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MjE0ODUsImV4cCI6MjA4NTA5NzQ4NX0.1DI8_CQpxNdtxhhq9-dAxObFxxD-5xan0MvUzNuxd-Y';

let supabaseClient = null;
let currentUser = null;

const App = {
    // State
    state: {
        username: '',
        currentScreen: 'loading',
        stars: 0,
        buddyInstance: null,
        currentActivity: null
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
    async onReady() {
        console.log('✅ DOM Ready');
        
        // Initialize Supabase
        if (typeof supabase !== 'undefined') {
            const { createClient } = supabase;
            supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase initialized');
            
            // Check if user is already logged in
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                currentUser = session.user;
                // Load user profile
                await this.loadUserProfile();
                // Skip to main screen
                setTimeout(() => {
                    this.showScreen('treehouseScreen');
                    if (typeof Buddy3D !== 'undefined') {
                        this.state.buddyInstance = Buddy3D.init('buddy-3d');
                    }
                }, 2000);
                return;
            }
        } else {
            console.warn('⚠️ Supabase not available');
        }
        
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

    // Handle login - now just captures name for existing auth session
    async handleLogin() {
        const input = document.getElementById('usernameInput');
        const username = input.value.trim();

        if (!username) {
            input.style.borderColor = '#E63946';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 1000);
            return;
        }

        // For authenticated users, just update display name
        if (currentUser) {
            this.state.username = username;
            
            // Update profile with name if needed
            await this.updateUserProfile({ full_name: username });
            
            // Load progress
            await this.loadProgress();
            
            // Initialize Buddy
            if (typeof Buddy3D !== 'undefined') {
                this.state.buddyInstance = Buddy3D.init('buddy-3d');
                console.log('🐻 Buddy initialized');
            }

            // Show main screen
            this.showScreen('treehouseScreen');
            this.updateSpeechBubble(`Hi ${username}! Ready to learn? 🎉`);
        } else {
            // No auth - show auth required message
            this.updateSpeechBubble('Please sign in to continue! 🔐');
        }
    },

    // Load user profile from Supabase
    async loadUserProfile() {
        if (!supabaseClient || !currentUser) return;
        
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .maybeSingle();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
                this.state.username = data.full_name || currentUser.email.split('@')[0];
                console.log('📂 Profile loaded:', data.full_name);
            } else {
                console.log('📂 No profile found, will create one');
                this.state.username = currentUser.email.split('@')[0];
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.state.username = currentUser.email.split('@')[0];
        }
    },

    // Update user profile
    async updateUserProfile(updates) {
        if (!supabaseClient || !currentUser) return;
        
        try {
            const { error } = await supabaseClient
                .from('profiles')
                .upsert({
                    id: currentUser.id,
                    email: currentUser.email,
                    ...updates,
                    updated_at: new Date().toISOString()
                });
            
            if (error) throw error;
            console.log('💾 Profile updated');
        } catch (error) {
            console.error('Error updating profile:', error);
        }
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
        this.state.currentActivity = activityName;
        
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
        
        // Save to Supabase if available
        this.saveProgress();
    },

    // Save progress to Supabase
    async saveProgress() {
        if (!supabaseClient || !currentUser || !this.state.currentActivity) return;
        
        try {
            const { error } = await supabaseClient
                .from('progress')
                .insert({
                    user_id: currentUser.id,
                    activity: this.state.currentActivity,
                    score: this.state.stars,
                    stars_earned: 1,
                    completed: false,
                    created_at: new Date().toISOString()
                });
            
            if (error) throw error;
            console.log('💾 Progress saved to Supabase');
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    },

    // Load progress from Supabase
    async loadProgress() {
        if (!supabaseClient || !currentUser) return;
        
        try {
            const { data, error } = await supabaseClient
                .from('progress')
                .select('stars_earned')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Sum up all stars
                const totalStars = data.reduce((sum, record) => sum + (record.stars_earned || 0), 0);
                this.state.stars = totalStars;
                this.updateStarCount();
                console.log('📂 Progress loaded from Supabase');
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
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

// ===== Supabase Authentication Functions =====

// Show auth modal
function showAuthModal() {
    document.getElementById('authModal').classList.add('active');
}

// Hide auth modal
function hideAuthModal() {
    document.getElementById('authModal').classList.remove('active');
}

// Switch between login/signup
document.getElementById('showSignup')?.addEventListener('click', () => {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
});

document.getElementById('showLogin')?.addEventListener('click', () => {
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
});

// Sign Up
document.getElementById('signupBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('signupName').value;
    const age = document.getElementById('signupAge').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (!name || !age || !email || !password) {
        showAuthError('Please fill in all fields');
        return;
    }
    
    if (!supabaseClient) {
        showAuthError('Authentication not available');
        return;
    }
    
    try {
        // Sign up with Supabase
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        if (data.user) {
            currentUser = data.user;
            
            // Save user profile
            await supabaseClient.from('profiles').upsert({
                id: data.user.id,
                email: email,
                full_name: name,
                age: parseInt(age),
                created_at: new Date().toISOString()
            });
            
            // Set username in app state
            App.state.username = name;
            
            hideAuthModal();
            
            // Show login screen to enter name
            App.showScreen('loginScreen');
            document.getElementById('usernameInput').value = name;
            
            console.log('✅ Signed up successfully');
        }
        
    } catch (error) {
        showAuthError(error.message || 'Signup failed');
        console.error(error);
    }
});

// Sign In
document.getElementById('loginBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAuthError('Please enter email and password');
        return;
    }
    
    if (!supabaseClient) {
        showAuthError('Authentication not available');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        if (data.user) {
            currentUser = data.user;
            await App.loadUserProfile();
            
            hideAuthModal();
            
            // Show login screen to confirm name
            App.showScreen('loginScreen');
            document.getElementById('usernameInput').value = App.state.username;
            
            console.log('✅ Signed in successfully');
        }
        
    } catch (error) {
        showAuthError(error.message || 'Login failed');
        console.error(error);
    }
});

// Show auth error
function showAuthError(message) {
    const errorEl = document.getElementById('authError');
    errorEl.textContent = message;
    setTimeout(() => {
        errorEl.textContent = '';
    }, 3000);
}

// Check if user needs to authenticate on page load
window.addEventListener('DOMContentLoaded', async () => {
    if (supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            // Show auth modal after loading screen
            setTimeout(() => {
                showAuthModal();
            }, 2000);
        }
    }
});
