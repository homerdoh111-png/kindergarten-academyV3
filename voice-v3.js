/**
 * Voice Feature - Talk to Buddy!
 * Pitch-shifted echo + jokes
 */

const BuddyVoice = (function() {
    'use strict';

    // Jokes pool (kid-friendly)
    const JOKES = [
        { setup: "Why do bears love the forest?", punchline: "Because it's bear-y fun!" },
        { setup: "What do you call a sleeping dinosaur?", punchline: "A dino-snore!" },
        { setup: "Why can't Elsa have a balloon?", punchline: "Because she'll let it go!" },
        { setup: "What do you call a fish without eyes?", punchline: "A fsh!" },
        { setup: "Why did the banana go to the doctor?", punchline: "Because it wasn't peeling well!" },
        { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" },
        { setup: "Why do cows wear bells?", punchline: "Because their horns don't work!" },
        { setup: "What did the ocean say to the beach?", punchline: "Nothing, it just waved!" },
        { setup: "Why are elephants bad at computers?", punchline: "They're afraid of the mouse!" },
        { setup: "What do you call a dog that does magic?", punchline: "A Labracadabrador!" }
    ];

    // State
    let audioContext = null;
    let mediaStream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;
    let lastJokeIndex = -1;

    // Initialize audio context
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }

    // Start recording
    async function startRecording() {
        try {
            initAudio();
            
            // Request microphone access
            mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Create media recorder
            mediaRecorder = new MediaRecorder(mediaStream);
            recordedChunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                await playbackPitchShifted();
            };

            mediaRecorder.start();
            isRecording = true;
            
            console.log('🎤 Recording started');
            return true;

        } catch (error) {
            console.error('Microphone access denied:', error);
            return false;
        }
    }

    // Stop recording
    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
            
            console.log('🎤 Recording stopped');
            return true;
        }
        return false;
    }

    // Play back with pitch shift (chipmunk effect)
    async function playbackPitchShifted() {
        if (recordedChunks.length === 0) return;

        try {
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Create source
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            
            // Pitch shift by playing faster (chipmunk effect)
            source.playbackRate.value = 1.55; // Higher = more chipmunk-y
            
            // Add some fun effects
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.8;
            
            // Connect and play
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            source.start(0);

            console.log('🐿️ Playing back with pitch shift');

        } catch (error) {
            console.error('Playback error:', error);
        }
    }

    // Tell a random joke
    function tellJoke() {
        let index;
        do {
            index = Math.floor(Math.random() * JOKES.length);
        } while (index === lastJokeIndex && JOKES.length > 1);
        
        lastJokeIndex = index;
        return JOKES[index];
    }

    // Speak text using Web Speech API
    function speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 1.5; // Higher pitch for Buddy
            utterance.rate = 1.1;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    // Check if voice is supported
    function isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    // Public API
    return {
        init: initAudio,
        startRecording,
        stopRecording,
        tellJoke,
        speak,
        isSupported,
        isRecording: () => isRecording
    };

})();
