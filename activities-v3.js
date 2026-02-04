/**
 * Activities Module - All Learning Activities
 * V3 - Tested and Working
 */

const Activities = {
    
    // Current state
    current: null,
    score: 0,
    
    // Activity data and generators
    data: {
        
        letters: {
            title: '📚 Learn Letters',
            generate: function() {
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
                const letter = letters[Math.floor(Math.random() * letters.length)];
                return {
                    question: `Find the letter: ${letter}`,
                    answer: letter,
                    options: [letter, ...getRandomLetters(letter, 3)]
                };
            }
        },
        
        numbers: {
            title: '🔢 Count & Numbers',
            generate: function() {
                const num = Math.floor(Math.random() * 20) + 1;
                return {
                    question: `Count the stars: ${'⭐'.repeat(num)}`,
                    answer: num.toString(),
                    options: [num, num + 1, num - 1, num + 2].map(n => n.toString()).filter(n => n > 0)
                };
            }
        },
        
        colors: {
            title: '🎨 Learn Colors',
            colors: [
                { name: 'Red', emoji: '🔴', code: '#FF0000' },
                { name: 'Blue', emoji: '🔵', code: '#0000FF' },
                { name: 'Yellow', emoji: '🟡', code: '#FFFF00' },
                { name: 'Green', emoji: '🟢', code: '#00FF00' },
                { name: 'Orange', emoji: '🟠', code: '#FFA500' },
                { name: 'Purple', emoji: '🟣', code: '#800080' }
            ],
            generate: function() {
                const color = this.colors[Math.floor(Math.random() * this.colors.length)];
                const wrongColors = this.colors.filter(c => c.name !== color.name)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3);
                
                return {
                    question: `What color is this? ${color.emoji}`,
                    answer: color.name,
                    options: [color, ...wrongColors].sort(() => Math.random() - 0.5).map(c => c.name)
                };
            }
        },
        
        shapes: {
            title: '⬛ Learn Shapes',
            shapes: [
                { name: 'Circle', emoji: '⭕' },
                { name: 'Square', emoji: '🟦' },
                { name: 'Triangle', emoji: '🔺' },
                { name: 'Star', emoji: '⭐' },
                { name: 'Heart', emoji: '❤️' }
            ],
            generate: function() {
                const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
                const wrongShapes = this.shapes.filter(s => s.name !== shape.name)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3);
                
                return {
                    question: `What shape is this? ${shape.emoji}`,
                    answer: shape.name,
                    options: [shape, ...wrongShapes].sort(() => Math.random() - 0.5).map(s => s.name)
                };
            }
        },
        
        math: {
            title: '➕ Math Fun',
            generate: function() {
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                const isAddition = Math.random() > 0.5;
                
                if (isAddition) {
                    const answer = a + b;
                    return {
                        question: `${a} + ${b} = ?`,
                        answer: answer.toString(),
                        options: [answer, answer + 1, answer - 1, answer + 2].map(n => n.toString())
                    };
                } else {
                    const answer = Math.max(a, b) - Math.min(a, b);
                    return {
                        question: `${Math.max(a, b)} - ${Math.min(a, b)} = ?`,
                        answer: answer.toString(),
                        options: [answer, answer + 1, answer - 1, answer + 2].map(n => n.toString()).filter(n => n >= 0)
                    };
                }
            }
        },
        
        time: {
            title: '🕐 Tell Time',
            generate: function() {
                const hour = Math.floor(Math.random() * 12) + 1;
                const minute = Math.random() < 0.5 ? 0 : 30;
                const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
                
                return {
                    question: 'What time is shown on the clock?',
                    answer: timeStr,
                    options: [
                        timeStr,
                        `${((hour % 12) + 1)}:${minute.toString().padStart(2, '0')}`,
                        `${hour}:${(minute === 0 ? 30 : 0).toString().padStart(2, '0')}`,
                        `${((hour + 1) % 12) || 12}:${minute.toString().padStart(2, '0')}`
                    ],
                    clockData: { hour, minute }
                };
            }
        },
        
        money: {
            title: '💰 Count Money',
            generate: function() {
                const coins = [
                    { value: 1, name: 'penny', emoji: '🪙' },
                    { value: 5, name: 'nickel', emoji: '🪙' },
                    { value: 10, name: 'dime', emoji: '🪙' },
                    { value: 25, name: 'quarter', emoji: '🪙' }
                ];
                
                const selectedCoins = [];
                const count = Math.floor(Math.random() * 3) + 2;
                let total = 0;
                
                for (let i = 0; i < count; i++) {
                    const coin = coins[Math.floor(Math.random() * coins.length)];
                    selectedCoins.push(coin);
                    total += coin.value;
                }
                
                return {
                    question: `How much? ${selectedCoins.map(c => c.emoji).join(' ')}`,
                    answer: `${total}¢`,
                    options: [`${total}¢`, `${total + 5}¢`, `${total - 5}¢`, `${total + 10}¢`].filter(o => !o.includes('-'))
                };
            }
        },
        
        logic: {
            title: '🧩 Logic Patterns',
            patterns: [
                { pattern: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟡'] },
                { pattern: ['⭐', '⭐', '🌙', '⭐', '⭐'], answer: '🌙', options: ['⭐', '🌙', '☀️'] },
                { pattern: ['🍎', '🍌', '🍎', '🍌'], answer: '🍎', options: ['🍎', '🍌', '🍇'] },
                { pattern: ['1', '2', '1', '2'], answer: '1', options: ['1', '2', '3'] },
                { pattern: ['🔺', '⭕', '🔺', '⭕'], answer: '🔺', options: ['🔺', '⭕', '🔲'] }
            ],
            generate: function() {
                const p = this.patterns[Math.floor(Math.random() * this.patterns.length)];
                return {
                    question: `What comes next? ${p.pattern.join(' ')} ?`,
                    answer: p.answer,
                    options: p.options
                };
            }
        },
        
        rhymes: {
            title: '🎵 Rhyming Words',
            pairs: [
                { word: 'cat', rhymes: ['hat', 'bat', 'rat'], notRhymes: ['dog', 'car'] },
                { word: 'dog', rhymes: ['log', 'frog', 'hog'], notRhymes: ['cat', 'run'] },
                { word: 'sun', rhymes: ['fun', 'run', 'bun'], notRhymes: ['moon', 'star'] },
                { word: 'tree', rhymes: ['bee', 'see', 'key'], notRhymes: ['car', 'house'] }
            ],
            generate: function() {
                const pair = this.pairs[Math.floor(Math.random() * this.pairs.length)];
                const rhyme = pair.rhymes[Math.floor(Math.random() * pair.rhymes.length)];
                const notRhyme = pair.notRhymes[Math.floor(Math.random() * pair.notRhymes.length)];
                const other = pair.rhymes.filter(r => r !== rhyme)[0];
                
                return {
                    question: `Which word rhymes with "${pair.word}"?`,
                    answer: rhyme,
                    options: [rhyme, notRhyme, other, pair.notRhymes[1]].filter(Boolean).slice(0, 4)
                };
            }
        },
        
        phonics: {
            title: '🗣️ Letter Sounds',
            sounds: [
                { letter: 'B', sound: '/b/', words: ['ball', 'bat', 'book'] },
                { letter: 'C', sound: '/k/', words: ['cat', 'car', 'cup'] },
                { letter: 'D', sound: '/d/', words: ['dog', 'door', 'duck'] },
                { letter: 'F', sound: '/f/', words: ['fish', 'frog', 'fan'] }
            ],
            generate: function() {
                const s = this.sounds[Math.floor(Math.random() * this.sounds.length)];
                const word = s.words[Math.floor(Math.random() * s.words.length)];
                const wrong = this.sounds.filter(x => x.letter !== s.letter)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3);
                
                return {
                    question: `"${word}" starts with which letter?`,
                    answer: s.letter,
                    options: [s.letter, ...wrong.map(x => x.letter)]
                };
            }
        }
    },
    
    // Load activity
    load: function(activityName, callbacks) {
        this.current = activityName;
        this.callbacks = callbacks || {};
        const activity = this.data[activityName];
        
        if (!activity) {
            console.error('Activity not found:', activityName);
            return;
        }
        
        // Generate question
        const question = activity.generate();
        
        // Update UI
        document.getElementById('activityTitle').textContent = activity.title;
        const content = document.getElementById('activityContent');
        
        content.innerHTML = `
            <div class="question">${question.question}</div>
            <div class="options">
                ${question.options.map(opt => 
                    `<button class="option-btn" data-answer="${opt}">${opt}</button>`
                ).join('')}
            </div>
        `;
        
        // Add clock display for time activity
        if (activityName === 'time' && question.clockData) {
            this.renderClock(question.clockData);
        }
        
        // Add click handlers
        content.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Mark as selected
                content.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.checkAnswer(btn.dataset.answer, question.answer);
            });
        });
    },
    
    // Check answer
    checkAnswer: function(selected, correct) {
        const isCorrect = selected === correct || selected === correct.toString();
        
        if (isCorrect) {
            this.score++;
            if (this.callbacks.updateScore) {
                this.callbacks.updateScore(this.score);
            }
            if (this.callbacks.onCorrect) {
                this.callbacks.onCorrect();
            }
            this.showFeedback(true);
            setTimeout(() => this.load(this.current, this.callbacks), 1500);
        } else {
            if (this.callbacks.onWrong) {
                this.callbacks.onWrong();
            }
            this.showFeedback(false);
        }
    },
    
    // Show feedback
    showFeedback: function(isCorrect) {
        // Visual feedback only - speech bubble handled by app
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.classList.contains('selected')) {
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
            }
        });
        
        setTimeout(() => {
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('correct', 'wrong', 'selected');
            });
        }, 1500);
    },
    
    // Render clock for time activity
    renderClock: function(clockData) {
        const content = document.getElementById('activityContent');
        const clockHTML = `
            <div class="clock" style="width: 200px; height: 200px; border: 4px solid #FFD700; border-radius: 50%; position: relative; background: white; margin: 20px auto;">
                ${[...Array(12)].map((_, i) => {
                    const angle = (i + 1) * 30 - 90;
                    const x = 50 + 40 * Math.cos(angle * Math.PI / 180);
                    const y = 50 + 40 * Math.sin(angle * Math.PI / 180);
                    return `<div style="position: absolute; left: ${x}%; top: ${y}%; transform: translate(-50%, -50%);">${i + 1}</div>`;
                }).join('')}
                <div class="hour-hand" style="position: absolute; width: 4px; height: 60px; background: #333; left: 50%; bottom: 50%; margin-left: -2px; margin-bottom: -60px; transform-origin: bottom center; transform: rotate(${(clockData.hour % 12) * 30 + clockData.minute / 2}deg);"></div>
                <div class="minute-hand" style="position: absolute; width: 3px; height: 80px; background: #0072ff; left: 50%; bottom: 50%; margin-left: -1.5px; margin-bottom: -80px; transform-origin: bottom center; transform: rotate(${clockData.minute * 6}deg);"></div>
                <div style="position: absolute; width: 12px; height: 12px; background: #333; border-radius: 50%; left: 50%; top: 50%; transform: translate(-50%, -50%);"></div>
            </div>
        `;
        
        content.insertAdjacentHTML('afterbegin', clockHTML);
    }
};

// Helper function
function getRandomLetters(exclude, count) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== exclude);
    return letters.sort(() => Math.random() - 0.5).slice(0, count);
}
