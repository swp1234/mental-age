// Mental Age Test - Brain Scan Engine
// 7 Interactive Cognitive Mini-Challenges

class BrainScanApp {
    constructor() {
        this.currentChallenge = 0;
        this.scores = []; // 0-100 per challenge
        this.mentalAge = null;
        this.category = null;
        this.challenges = [
            'memory', 'reaction', 'pattern',
            'word', 'stroop', 'emotion', 'number'
        ];
        this.challengeIcons = ['🧩', '⚡', '🔷', '💬', '🎯', '😊', '🔢'];
        this._timers = [];
        this.hideLoader();
        this.init();
    }

    hideLoader() {
        window.addEventListener('load', () => {
            const loader = document.getElementById('app-loader');
            if (loader) {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 300);
            }
        });
    }

    async init() {
        try {
            if (window.i18n && typeof window.i18n.init === 'function') {
                await i18n.init();
            }
        } catch (e) {
            console.warn('i18n init failed:', e.message);
        }
        this.setupEventListeners();
        this.setupServiceWorker();
    }

    // ========== EVENT LISTENERS ==========

    setupEventListeners() {
        const startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.addEventListener('click', () => this.startTest());

        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) retryBtn.addEventListener('click', () => this.resetTest());

        // Language selector
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) langToggle.addEventListener('click', () => this.toggleLangMenu());

        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                if (lang) this.changeLang(lang);
            });
        });

        // Theme toggle
        this.initTheme();

        // Share buttons
        const shareDownload = document.getElementById('share-image-download');
        const shareTwitter = document.getElementById('share-twitter');
        const shareFacebook = document.getElementById('share-facebook');
        const shareCopy = document.getElementById('share-copy');
        if (shareDownload) shareDownload.addEventListener('click', () => this.downloadImage());
        if (shareTwitter) shareTwitter.addEventListener('click', () => this.shareTwitter());
        if (shareFacebook) shareFacebook.addEventListener('click', () => this.shareFacebook());
        if (shareCopy) shareCopy.addEventListener('click', () => this.shareCopy());

        this.setupGA();
    }

    setupGA() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Mental Age Test - Brain Scan',
                page_location: window.location.href
            });
        }
    }

    toggleLangMenu() {
        const menu = document.getElementById('lang-menu');
        menu.classList.toggle('hidden');
    }

    async changeLang(lang) {
        await i18n.setLanguage(lang);
        document.getElementById('lang-menu').classList.add('hidden');
        // Re-render result if on result screen
        if (this.category) {
            this.displayResult();
        }
    }

    // ========== FLOW CONTROL ==========

    startTest() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'test_start', {
                app_name: 'mental-age',
                content_type: 'brain_scan',
                event_category: 'engagement'
            });
        }
        this.currentChallenge = 0;
        this.scores = [];
        this.mentalAge = null;
        this.category = null;
        this._clearTimers();
        this.showScreen('challenge-screen');
        this.runChallenge();
    }

    resetTest() {
        this.currentChallenge = 0;
        this.scores = [];
        this.mentalAge = null;
        this.category = null;
        this._clearTimers();
        this.showScreen('intro-screen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
        window.scrollTo(0, 0);
    }

    _clearTimers() {
        this._timers.forEach(t => clearTimeout(t));
        this._timers = [];
    }

    _setTimeout(fn, ms) {
        const id = setTimeout(fn, ms);
        this._timers.push(id);
        return id;
    }

    // ========== CHALLENGE RUNNER ==========

    runChallenge() {
        const idx = this.currentChallenge;
        if (idx >= this.challenges.length) {
            this.showAnalyzing();
            return;
        }

        // Update progress
        const progress = ((idx + 1) / this.challenges.length) * 100;
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) progressFill.style.width = progress + '%';
        const currentEl = document.getElementById('current-challenge');
        if (currentEl) currentEl.textContent = idx + 1;

        // Show instruction
        this.showInstruction(idx, () => {
            const name = this.challenges[idx];
            switch (name) {
                case 'memory': this.runMemoryGrid(); break;
                case 'reaction': this.runReactionSpeed(); break;
                case 'pattern': this.runPatternRecognition(); break;
                case 'word': this.runWordAssociation(); break;
                case 'stroop': this.runStroopFocus(); break;
                case 'emotion': this.runEmotionalReading(); break;
                case 'number': this.runNumberMemory(); break;
            }
        });
    }

    showInstruction(idx, callback) {
        const overlay = document.getElementById('challenge-instruction');
        const icon = document.getElementById('instruction-icon');
        const title = document.getElementById('instruction-title');
        const text = document.getElementById('instruction-text');
        const countdown = document.getElementById('instruction-countdown');

        overlay.classList.remove('hidden');
        icon.textContent = this.challengeIcons[idx];
        title.textContent = i18n.t(`challenge.${this.challenges[idx]}_title`);
        text.textContent = i18n.t(`challenge.${this.challenges[idx]}_instruction`);

        let count = 3;
        countdown.textContent = count;

        const interval = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(interval);
                overlay.classList.add('hidden');
                callback();
            } else {
                countdown.textContent = count;
            }
        }, 800);

        this._timers.push(interval);
    }

    showScoreFeedback(score, callback) {
        const overlay = document.getElementById('score-feedback');
        const starsEl = document.getElementById('score-stars');
        const pointsEl = document.getElementById('score-points');
        const labelEl = document.getElementById('score-label');

        // Star rating: 1-3 stars
        let stars = 1;
        if (score >= 70) stars = 3;
        else if (score >= 40) stars = 2;

        const starStr = Array(stars).fill('\u2b50').join('') + Array(3 - stars).fill('\u2606').join('');
        starsEl.textContent = starStr;
        pointsEl.textContent = score + '/100';

        let labelKey = 'score.good';
        if (score >= 80) labelKey = 'score.excellent';
        else if (score >= 60) labelKey = 'score.great';
        else if (score >= 40) labelKey = 'score.good';
        else labelKey = 'score.keep_trying';
        labelEl.textContent = i18n.t(labelKey);

        overlay.classList.remove('hidden');

        this._setTimeout(() => {
            overlay.classList.add('hidden');
            callback();
        }, 1500);
    }

    finishChallenge(score) {
        // Clamp score
        score = Math.max(0, Math.min(100, Math.round(score)));
        this.scores.push(score);

        this.showScoreFeedback(score, () => {
            this.currentChallenge++;
            this.runChallenge();
        });
    }

    // ========== CHALLENGE 1: MEMORY GRID ==========

    runMemoryGrid() {
        const area = document.getElementById('challenge-area');
        area.innerHTML = '';

        // Create 4x4 grid
        const grid = document.createElement('div');
        grid.className = 'memory-grid';

        const cells = [];
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('button');
            cell.className = 'memory-cell';
            cell.dataset.index = i;
            cell.setAttribute('aria-label', `Cell ${i + 1}`);
            cells.push(cell);
            grid.appendChild(cell);
        }
        area.appendChild(grid);

        // Pick 5 random cells to highlight
        const highlighted = [];
        while (highlighted.length < 5) {
            const r = Math.floor(Math.random() * 16);
            if (!highlighted.includes(r)) highlighted.push(r);
        }

        // Show highlighted cells for 3 seconds
        highlighted.forEach(i => cells[i].classList.add('highlighted'));

        this._setTimeout(() => {
            // Hide highlights, let user tap
            highlighted.forEach(i => cells[i].classList.remove('highlighted'));

            const selected = [];
            cells.forEach(cell => {
                cell.addEventListener('click', () => {
                    const idx = parseInt(cell.dataset.index);
                    if (selected.includes(idx)) {
                        // Deselect
                        selected.splice(selected.indexOf(idx), 1);
                        cell.classList.remove('selected');
                    } else if (selected.length < 5) {
                        selected.push(idx);
                        cell.classList.add('selected');
                    }

                    // Auto submit when 5 selected
                    if (selected.length === 5) {
                        this._setTimeout(() => {
                            // Show results
                            let correct = 0;
                            cells.forEach((c, ci) => {
                                if (highlighted.includes(ci) && selected.includes(ci)) {
                                    c.classList.add('correct');
                                    correct++;
                                } else if (selected.includes(ci) && !highlighted.includes(ci)) {
                                    c.classList.add('wrong');
                                } else if (highlighted.includes(ci)) {
                                    c.classList.add('highlighted');
                                }
                            });
                            this._setTimeout(() => {
                                this.finishChallenge((correct / 5) * 100);
                            }, 800);
                        }, 300);
                    }
                });
            });
        }, 3000);
    }

    // ========== CHALLENGE 2: REACTION SPEED ==========

    runReactionSpeed() {
        const area = document.getElementById('challenge-area');
        area.innerHTML = '';

        const box = document.createElement('div');
        box.className = 'reaction-area waiting';
        box.textContent = i18n.t('challenge.reaction_wait');
        area.appendChild(box);

        let state = 'waiting'; // waiting -> ready -> done
        let startTime = 0;
        let tooEarlyCount = 0;

        // Random delay 2-5 seconds
        const delay = 2000 + Math.random() * 3000;

        const readyTimer = this._setTimeout(() => {
            if (state === 'waiting') {
                state = 'ready';
                box.className = 'reaction-area ready';
                box.textContent = i18n.t('challenge.reaction_tap');
                startTime = performance.now();
            }
        }, delay);

        box.addEventListener('click', () => {
            if (state === 'waiting') {
                // Too early
                tooEarlyCount++;
                state = 'too-early';
                clearTimeout(readyTimer);
                box.className = 'reaction-area too-early';
                box.textContent = i18n.t('challenge.reaction_early');

                this._setTimeout(() => {
                    if (tooEarlyCount >= 3) {
                        // Give low score after 3 premature taps
                        this.finishChallenge(10);
                    } else {
                        state = 'waiting';
                        box.className = 'reaction-area waiting';
                        box.textContent = i18n.t('challenge.reaction_wait');
                        const newDelay = 2000 + Math.random() * 3000;
                        this._setTimeout(() => {
                            if (state === 'waiting') {
                                state = 'ready';
                                box.className = 'reaction-area ready';
                                box.textContent = i18n.t('challenge.reaction_tap');
                                startTime = performance.now();
                            }
                        }, newDelay);
                    }
                }, 1000);
            } else if (state === 'ready') {
                const reactionTime = performance.now() - startTime;
                state = 'done';
                box.className = 'reaction-area done';
                box.textContent = Math.round(reactionTime) + 'ms';

                // Score: <200ms=100, 200-300ms=80, 300-400ms=60, 400-500ms=40, >500ms=20
                let score;
                if (reactionTime < 200) score = 100;
                else if (reactionTime < 300) score = 80;
                else if (reactionTime < 400) score = 60;
                else if (reactionTime < 500) score = 40;
                else score = 20;

                this._setTimeout(() => {
                    this.finishChallenge(score);
                }, 800);
            }
        });
    }

    // ========== CHALLENGE 3: PATTERN RECOGNITION ==========

    runPatternRecognition() {
        const area = document.getElementById('challenge-area');
        const patterns = this._getPatternData();
        let round = 0;
        let totalScore = 0;
        const totalRounds = 3;

        const runRound = () => {
            if (round >= totalRounds) {
                this.finishChallenge(totalScore / totalRounds);
                return;
            }

            area.innerHTML = '';
            const p = patterns[round];

            // Round counter
            const counter = document.createElement('div');
            counter.className = 'round-counter';
            counter.textContent = `${round + 1}/${totalRounds}`;
            area.appendChild(counter);

            // Pattern display
            const display = document.createElement('div');
            display.className = 'pattern-display';
            p.sequence.forEach(item => {
                const el = document.createElement('div');
                el.className = 'pattern-item';
                el.textContent = item;
                display.appendChild(el);
            });
            // Mystery slot
            const mystery = document.createElement('div');
            mystery.className = 'pattern-item mystery';
            mystery.textContent = '?';
            display.appendChild(mystery);
            area.appendChild(display);

            // Options
            const options = document.createElement('div');
            options.className = 'pattern-options';
            const roundStart = performance.now();

            p.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'pattern-option';
                btn.textContent = opt;
                btn.addEventListener('click', () => {
                    const elapsed = performance.now() - roundStart;
                    const isCorrect = opt === p.answer;

                    options.querySelectorAll('button').forEach(b => {
                        b.style.pointerEvents = 'none';
                        if (b.textContent === p.answer) b.classList.add('correct');
                    });
                    if (!isCorrect) btn.classList.add('wrong');

                    // Score: correctness * speed bonus
                    let score = 0;
                    if (isCorrect) {
                        score = 70;
                        if (elapsed < 3000) score += 30;
                        else if (elapsed < 5000) score += 15;
                    }
                    totalScore += score;

                    this._setTimeout(() => {
                        round++;
                        runRound();
                    }, 700);
                });
                options.appendChild(btn);
            });
            area.appendChild(options);
        };

        runRound();
    }

    _getPatternData() {
        return [
            {
                sequence: ['⬛', '🔵', '⬛', '🔵', '⬛'],
                options: ['🔵', '⬛', '🔴'],
                answer: '🔵'
            },
            {
                sequence: ['🔴', '🔴', '🔵', '🔴', '🔴'],
                options: ['🔴', '🔵', '🟢'],
                answer: '🔵'
            },
            {
                sequence: ['⭐', '⭐', '🌙', '⭐', '⭐'],
                options: ['⭐', '🌙', '☀️'],
                answer: '🌙'
            }
        ];
    }

    // ========== CHALLENGE 4: WORD ASSOCIATION ==========

    runWordAssociation() {
        const area = document.getElementById('challenge-area');
        const words = this._getWordData();
        let round = 0;
        let totalScore = 0;
        const totalRounds = 3;

        const runRound = () => {
            if (round >= totalRounds) {
                this.finishChallenge(totalScore / totalRounds);
                return;
            }

            area.innerHTML = '';
            const w = words[round];

            // Round counter
            const counter = document.createElement('div');
            counter.className = 'round-counter';
            counter.textContent = `${round + 1}/${totalRounds}`;
            area.appendChild(counter);

            // Timer bar
            const timerBar = document.createElement('div');
            timerBar.className = 'timer-bar';
            const timerFill = document.createElement('div');
            timerFill.className = 'timer-bar-fill';
            timerBar.appendChild(timerFill);
            area.appendChild(timerBar);

            // Word display
            const wordEl = document.createElement('div');
            wordEl.className = 'word-display';
            wordEl.textContent = i18n.t(w.wordKey);
            area.appendChild(wordEl);

            // Options
            const options = document.createElement('div');
            options.className = 'word-options';
            const roundStart = performance.now();
            let answered = false;
            const timeLimit = 5000;

            w.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'word-option';
                btn.textContent = i18n.t(opt.key);
                btn.addEventListener('click', () => {
                    if (answered) return;
                    answered = true;
                    clearInterval(timerInterval);
                    const elapsed = performance.now() - roundStart;

                    options.querySelectorAll('button').forEach(b => {
                        b.style.pointerEvents = 'none';
                    });

                    if (opt.correct) {
                        btn.classList.add('correct');
                        let score = 60;
                        if (elapsed < 2000) score = 100;
                        else if (elapsed < 3500) score = 80;
                        totalScore += score;
                    } else {
                        btn.classList.add('wrong');
                        // Find correct and highlight
                        w.options.forEach((o, oi) => {
                            if (o.correct) {
                                options.children[oi].classList.add('correct');
                            }
                        });
                    }

                    this._setTimeout(() => {
                        round++;
                        runRound();
                    }, 700);
                });
                options.appendChild(btn);
            });
            area.appendChild(options);

            // Timer animation
            let elapsed = 0;
            const timerInterval = setInterval(() => {
                elapsed += 100;
                const pct = Math.max(0, 100 - (elapsed / timeLimit) * 100);
                timerFill.style.width = pct + '%';
                if (elapsed >= timeLimit && !answered) {
                    answered = true;
                    clearInterval(timerInterval);
                    // Time's up
                    options.querySelectorAll('button').forEach(b => {
                        b.style.pointerEvents = 'none';
                    });
                    w.options.forEach((o, oi) => {
                        if (o.correct) {
                            options.children[oi].classList.add('correct');
                        }
                    });
                    this._setTimeout(() => {
                        round++;
                        runRound();
                    }, 700);
                }
            }, 100);
            this._timers.push(timerInterval);
        };

        runRound();
    }

    _getWordData() {
        return [
            {
                wordKey: 'word.sun',
                options: [
                    { key: 'word.moon', correct: true },
                    { key: 'word.table', correct: false },
                    { key: 'word.book', correct: false },
                    { key: 'word.car', correct: false }
                ]
            },
            {
                wordKey: 'word.ocean',
                options: [
                    { key: 'word.chair', correct: false },
                    { key: 'word.wave', correct: true },
                    { key: 'word.pen', correct: false },
                    { key: 'word.clock', correct: false }
                ]
            },
            {
                wordKey: 'word.fire',
                options: [
                    { key: 'word.ice', correct: true },
                    { key: 'word.shoe', correct: false },
                    { key: 'word.lamp', correct: false },
                    { key: 'word.ring', correct: false }
                ]
            }
        ];
    }

    // ========== CHALLENGE 5: STROOP FOCUS ==========

    runStroopFocus() {
        const area = document.getElementById('challenge-area');
        const rounds = this._getStroopData();
        let round = 0;
        let totalScore = 0;
        const totalRounds = 5;

        const runRound = () => {
            if (round >= totalRounds) {
                this.finishChallenge(totalScore / totalRounds);
                return;
            }

            area.innerHTML = '';
            const s = rounds[round];

            // Round counter
            const counter = document.createElement('div');
            counter.className = 'round-counter';
            counter.textContent = `${round + 1}/${totalRounds}`;
            area.appendChild(counter);

            // Instruction reminder
            const hint = document.createElement('div');
            hint.style.cssText = 'font-size:13px;color:var(--text-secondary);margin-bottom:12px;text-align:center;';
            hint.textContent = i18n.t('challenge.stroop_hint');
            area.appendChild(hint);

            // Stroop word (word in wrong color)
            const word = document.createElement('div');
            word.className = 'stroop-word';
            word.textContent = i18n.t(s.wordKey);
            word.style.color = s.displayColor;
            area.appendChild(word);

            // Options (color names)
            const options = document.createElement('div');
            options.className = 'stroop-options';
            const roundStart = performance.now();

            s.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'stroop-option';
                btn.textContent = i18n.t(opt.key);
                btn.addEventListener('click', () => {
                    const elapsed = performance.now() - roundStart;
                    options.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');

                    if (opt.isAnswer) {
                        btn.classList.add('correct');
                        let score = 60;
                        if (elapsed < 2000) score = 100;
                        else if (elapsed < 3500) score = 80;
                        totalScore += score;
                    } else {
                        btn.classList.add('wrong');
                        s.options.forEach((o, oi) => {
                            if (o.isAnswer) options.children[oi].classList.add('correct');
                        });
                    }

                    this._setTimeout(() => {
                        round++;
                        runRound();
                    }, 600);
                });
                options.appendChild(btn);
            });
            area.appendChild(options);
        };

        runRound();
    }

    _getStroopData() {
        // Each: word is one color name, displayed in a DIFFERENT color
        // User must pick the DISPLAY COLOR
        return [
            {
                wordKey: 'color.red',
                displayColor: '#3b82f6',
                options: [
                    { key: 'color.red', isAnswer: false },
                    { key: 'color.blue', isAnswer: true },
                    { key: 'color.green', isAnswer: false },
                    { key: 'color.yellow', isAnswer: false }
                ]
            },
            {
                wordKey: 'color.green',
                displayColor: '#ef4444',
                options: [
                    { key: 'color.blue', isAnswer: false },
                    { key: 'color.green', isAnswer: false },
                    { key: 'color.red', isAnswer: true },
                    { key: 'color.yellow', isAnswer: false }
                ]
            },
            {
                wordKey: 'color.blue',
                displayColor: '#f59e0b',
                options: [
                    { key: 'color.yellow', isAnswer: true },
                    { key: 'color.blue', isAnswer: false },
                    { key: 'color.red', isAnswer: false },
                    { key: 'color.green', isAnswer: false }
                ]
            },
            {
                wordKey: 'color.yellow',
                displayColor: '#22c55e',
                options: [
                    { key: 'color.red', isAnswer: false },
                    { key: 'color.yellow', isAnswer: false },
                    { key: 'color.green', isAnswer: true },
                    { key: 'color.blue', isAnswer: false }
                ]
            },
            {
                wordKey: 'color.red',
                displayColor: '#22c55e',
                options: [
                    { key: 'color.green', isAnswer: true },
                    { key: 'color.red', isAnswer: false },
                    { key: 'color.blue', isAnswer: false },
                    { key: 'color.yellow', isAnswer: false }
                ]
            }
        ];
    }

    // ========== CHALLENGE 6: EMOTIONAL READING ==========

    runEmotionalReading() {
        const area = document.getElementById('challenge-area');
        const scenarios = this._getEmotionData();
        let round = 0;
        let totalScore = 0;
        const totalRounds = 3;

        const runRound = () => {
            if (round >= totalRounds) {
                this.finishChallenge(totalScore / totalRounds);
                return;
            }

            area.innerHTML = '';
            const e = scenarios[round];

            // Round counter
            const counter = document.createElement('div');
            counter.className = 'round-counter';
            counter.textContent = `${round + 1}/${totalRounds}`;
            area.appendChild(counter);

            // Emoji
            const emoji = document.createElement('div');
            emoji.className = 'emotion-emoji';
            emoji.textContent = e.emoji;
            area.appendChild(emoji);

            // Scenario text
            const scenario = document.createElement('div');
            scenario.className = 'emotion-scenario';
            scenario.textContent = i18n.t(e.scenarioKey);
            area.appendChild(scenario);

            // Options
            const options = document.createElement('div');
            options.className = 'emotion-options';

            e.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'emotion-option';
                btn.textContent = i18n.t(opt.key);
                btn.addEventListener('click', () => {
                    options.querySelectorAll('button').forEach(b => b.style.pointerEvents = 'none');

                    if (opt.correct) {
                        btn.classList.add('correct');
                        totalScore += 100;
                    } else {
                        btn.classList.add('wrong');
                        e.options.forEach((o, oi) => {
                            if (o.correct) options.children[oi].classList.add('correct');
                        });
                    }

                    this._setTimeout(() => {
                        round++;
                        runRound();
                    }, 700);
                });
                options.appendChild(btn);
            });
            area.appendChild(options);
        };

        runRound();
    }

    _getEmotionData() {
        return [
            {
                emoji: '😊👋',
                scenarioKey: 'emotion.scenario_1',
                options: [
                    { key: 'emotion.happy', correct: true },
                    { key: 'emotion.angry', correct: false },
                    { key: 'emotion.sad', correct: false },
                    { key: 'emotion.scared', correct: false }
                ]
            },
            {
                emoji: '😤💢',
                scenarioKey: 'emotion.scenario_2',
                options: [
                    { key: 'emotion.surprised', correct: false },
                    { key: 'emotion.frustrated', correct: true },
                    { key: 'emotion.bored', correct: false },
                    { key: 'emotion.happy', correct: false }
                ]
            },
            {
                emoji: '😰💦',
                scenarioKey: 'emotion.scenario_3',
                options: [
                    { key: 'emotion.excited', correct: false },
                    { key: 'emotion.calm', correct: false },
                    { key: 'emotion.anxious', correct: true },
                    { key: 'emotion.proud', correct: false }
                ]
            }
        ];
    }

    // ========== CHALLENGE 7: NUMBER MEMORY ==========

    runNumberMemory() {
        const area = document.getElementById('challenge-area');
        let digitCount = 3;
        let maxDigits = 7;
        let bestCorrect = 0;

        const runRound = () => {
            if (digitCount > maxDigits) {
                // Calculate score: 3 correct=20, 4=40, 5=60, 6=80, 7=100
                const score = Math.round((bestCorrect / maxDigits) * 100);
                this.finishChallenge(score);
                return;
            }

            area.innerHTML = '';

            // Round counter
            const counter = document.createElement('div');
            counter.className = 'round-counter';
            counter.textContent = `${digitCount - 2}/${maxDigits - 2}`;
            area.appendChild(counter);

            // Generate random number
            let num = '';
            for (let i = 0; i < digitCount; i++) {
                num += Math.floor(Math.random() * 10);
            }

            // Display number
            const display = document.createElement('div');
            display.className = 'number-display';
            display.textContent = num;
            area.appendChild(display);

            // Show for (1 + 0.5 * digitCount) seconds
            const showTime = 1000 + digitCount * 500;

            this._setTimeout(() => {
                // Hide number, show input
                display.textContent = '?'.repeat(digitCount);
                display.style.color = 'var(--text-secondary)';

                const inputWrap = document.createElement('div');
                inputWrap.className = 'number-input-wrap';

                const input = document.createElement('input');
                input.type = 'text';
                input.inputMode = 'numeric';
                input.pattern = '[0-9]*';
                input.className = 'number-input';
                input.maxLength = digitCount;
                input.placeholder = '?'.repeat(digitCount);
                input.setAttribute('aria-label', i18n.t('challenge.number_input_label') || 'Enter the number');
                inputWrap.appendChild(input);

                const submit = document.createElement('button');
                submit.className = 'number-submit';
                submit.textContent = i18n.t('button.submit') || 'Submit';
                inputWrap.appendChild(submit);

                area.appendChild(inputWrap);
                input.focus();

                const checkAnswer = () => {
                    const answer = input.value.trim();
                    if (answer === num) {
                        bestCorrect = digitCount;
                        display.textContent = num;
                        display.style.color = 'var(--success-color)';
                        this._setTimeout(() => {
                            digitCount++;
                            runRound();
                        }, 600);
                    } else {
                        display.textContent = num;
                        display.style.color = 'var(--error-color)';
                        // End number memory
                        this._setTimeout(() => {
                            const score = Math.round((bestCorrect / maxDigits) * 100);
                            this.finishChallenge(score);
                        }, 800);
                    }
                };

                submit.addEventListener('click', checkAnswer);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') checkAnswer();
                });
            }, showTime);
        };

        runRound();
    }

    // ========== ANALYZING & RESULT ==========

    showAnalyzing() {
        this.showScreen('analyzing-screen');
        this._setTimeout(() => {
            this.calculateResult();
        }, 2500);
    }

    calculateResult() {
        // Composite score = average of 7 challenge scores
        const composite = this.scores.reduce((a, b) => a + b, 0) / this.scores.length;

        // Map to mental age
        if (composite <= 20) {
            this.mentalAge = Math.round(5 + (composite / 20) * 7); // 5-12
            this.category = 'child';
        } else if (composite <= 40) {
            this.mentalAge = Math.round(13 + ((composite - 20) / 20) * 6); // 13-19
            this.category = 'teenager';
        } else if (composite <= 60) {
            this.mentalAge = Math.round(20 + ((composite - 40) / 20) * 14); // 20-34
            this.category = 'youngAdult';
        } else if (composite <= 80) {
            this.mentalAge = Math.round(35 + ((composite - 60) / 20) * 20); // 35-55
            this.category = 'matureMind';
        } else {
            this.mentalAge = Math.round(56 + ((composite - 80) / 20) * 24); // 56-80
            this.category = 'elderSage';
        }

        // GA4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'test_complete', {
                app_name: 'mental-age',
                event_category: 'engagement',
                mental_age: this.mentalAge,
                category: this.category,
                composite_score: Math.round(composite)
            });
        }

        this._setTimeout(() => {
            this.showScreen('result-screen');
            this.displayResult();
        }, 500);
    }

    displayResult() {
        const cat = this.category;
        const catData = this._getCategoryData()[cat];

        // Age display
        const ageEl = document.getElementById('result-age');
        if (ageEl) ageEl.textContent = this.mentalAge;

        const titleEl = document.getElementById('result-title');
        if (titleEl) titleEl.textContent = catData.emoji + ' ' + i18n.t(catData.nameKey);

        const taglineEl = document.getElementById('result-tagline');
        if (taglineEl) taglineEl.textContent = i18n.t(catData.taglineKey);

        const descEl = document.getElementById('result-description');
        if (descEl) descEl.innerHTML = '<p>' + i18n.t(catData.descriptionKey) + '</p>';

        // Radar chart
        this.drawRadarChart();

        // Score breakdown
        this.displayScoreBreakdown();

        // Confetti
        this.createConfetti();
    }

    _getCategoryData() {
        return {
            child: {
                emoji: '🧒',
                nameKey: 'category.child',
                taglineKey: 'category.child_tagline',
                descriptionKey: 'category.child_description',
                range: '5-12'
            },
            teenager: {
                emoji: '🌟',
                nameKey: 'category.teenager',
                taglineKey: 'category.teenager_tagline',
                descriptionKey: 'category.teenager_description',
                range: '13-19'
            },
            youngAdult: {
                emoji: '🚀',
                nameKey: 'category.youngAdult',
                taglineKey: 'category.youngAdult_tagline',
                descriptionKey: 'category.youngAdult_description',
                range: '20-34'
            },
            matureMind: {
                emoji: '🎯',
                nameKey: 'category.matureMind',
                taglineKey: 'category.matureMind_tagline',
                descriptionKey: 'category.matureMind_description',
                range: '35-55'
            },
            elderSage: {
                emoji: '🦉',
                nameKey: 'category.elderSage',
                taglineKey: 'category.elderSage_tagline',
                descriptionKey: 'category.elderSage_description',
                range: '56-80'
            }
        };
    }

    // ========== RADAR CHART ==========

    drawRadarChart() {
        const canvas = document.getElementById('radar-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) / 2 - 40;

        ctx.clearRect(0, 0, w, h);

        const labels = this.challenges.map((c, i) =>
            i18n.t(`challenge.${c}_name`)
        );
        const values = this.scores.map(s => s / 100);
        const n = labels.length;
        const angleStep = (Math.PI * 2) / n;

        // Draw grid circles
        for (let level = 1; level <= 4; level++) {
            const r = (radius * level) / 4;
            ctx.beginPath();
            for (let i = 0; i <= n; i++) {
                const angle = (i % n) * angleStep - Math.PI / 2;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw axis lines
        for (let i = 0; i < n; i++) {
            const angle = i * angleStep - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw data polygon
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
            const idx = i % n;
            const angle = idx * angleStep - Math.PI / 2;
            const r = radius * values[idx];
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.fillStyle = 'rgba(8, 145, 178, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw data points
        for (let i = 0; i < n; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const r = radius * values[i];
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#22d3ee';
            ctx.fill();
        }

        // Draw labels
        ctx.fillStyle = '#b0b0b0';
        ctx.font = '12px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        for (let i = 0; i < n; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const labelR = radius + 24;
            const x = cx + labelR * Math.cos(angle);
            const y = cy + labelR * Math.sin(angle);
            ctx.fillText(labels[i], x, y + 4);
        }
    }

    displayScoreBreakdown() {
        const list = document.getElementById('scores-list');
        if (!list) return;
        list.innerHTML = '';

        this.challenges.forEach((c, i) => {
            const row = document.createElement('div');
            row.className = 'score-row';

            const icon = document.createElement('div');
            icon.className = 'score-icon';
            icon.textContent = this.challengeIcons[i];

            const info = document.createElement('div');
            info.className = 'score-info';

            const name = document.createElement('div');
            name.className = 'score-name';
            name.textContent = i18n.t(`challenge.${c}_name`);

            const bar = document.createElement('div');
            bar.className = 'score-bar';
            const fill = document.createElement('div');
            fill.className = 'score-bar-fill';
            fill.style.width = '0%';
            bar.appendChild(fill);

            info.appendChild(name);
            info.appendChild(bar);

            const value = document.createElement('div');
            value.className = 'score-value';
            value.textContent = this.scores[i];

            row.appendChild(icon);
            row.appendChild(info);
            row.appendChild(value);
            list.appendChild(row);

            // Animate bar fill
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    fill.style.width = this.scores[i] + '%';
                });
            });
        });
    }

    // ========== CONFETTI ==========

    createConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        container.innerHTML = '';

        const colors = ['#e040fb', '#ff69f8', '#00d4ff', '#ff6b6b', '#4ecdc4', '#ffd93d'];

        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3500);
        }
    }

    // ========== SHARING ==========

    shareTwitter() {
        const catData = this._getCategoryData()[this.category];
        const categoryName = i18n.t(catData.nameKey);
        const template = i18n.t('share.twitterText') || 'My mental age is {age}! I got {type} {emoji}. What is yours?';
        const text = template
            .replace('{age}', this.mentalAge)
            .replace('{type}', categoryName)
            .replace('{emoji}', catData.emoji);
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'width=550,height=420');

        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', { method: 'twitter', mental_age: this.mentalAge });
        }
    }

    shareFacebook() {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank', 'width=550,height=420');

        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', { method: 'facebook', mental_age: this.mentalAge });
        }
    }

    shareCopy() {
        const catData = this._getCategoryData()[this.category];
        const categoryName = i18n.t(catData.nameKey);
        const template = i18n.t('share.copyText') || 'My mental age is {age}! I got {type} {emoji}. {url}';
        const text = template
            .replace('{age}', this.mentalAge)
            .replace('{type}', categoryName)
            .replace('{emoji}', catData.emoji)
            .replace('{url}', window.location.href);

        navigator.clipboard.writeText(text).then(() => {
            alert(i18n.t('message.copy_success') || 'Copied!');
            if (typeof gtag !== 'undefined') {
                gtag('event', 'share', { method: 'copy', mental_age: this.mentalAge });
            }
        }).catch(() => {
            alert(i18n.t('message.copy_error') || 'Copy failed.');
        });
    }

    downloadImage() {
        const canvas = document.getElementById('result-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const catData = this._getCategoryData()[this.category];
        const w = canvas.width;
        const h = canvas.height;

        // Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#1a1a2e');
        bgGrad.addColorStop(1, '#16213e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Accent bar
        const hGrad = ctx.createLinearGradient(0, 0, w, 0);
        hGrad.addColorStop(0, '#0891b2');
        hGrad.addColorStop(1, '#22d3ee');
        ctx.fillStyle = hGrad;
        ctx.fillRect(0, 0, w, 8);

        // Subtitle
        ctx.fillStyle = '#a0a0c0';
        ctx.font = '600 32px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(i18n.t('share.canvasSubtitle') || 'My Mental Age Is...', w / 2, 80);

        // Age number
        ctx.fillStyle = '#0891b2';
        ctx.font = 'bold 160px Arial, sans-serif';
        ctx.fillText(String(this.mentalAge), w / 2, 260);

        // Emoji
        ctx.font = '72px Arial, sans-serif';
        ctx.fillText(catData.emoji, w / 2, 360);

        // Category name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px Arial, sans-serif';
        ctx.fillText(i18n.t(catData.nameKey), w / 2, 430);

        // Tagline
        ctx.fillStyle = '#a0a0c0';
        ctx.font = '24px Arial, sans-serif';
        this._wrapCanvasText(ctx, i18n.t(catData.taglineKey), w / 2, 475, w - 120, 30);

        // Mini radar (simplified bars)
        const barY = 550;
        const barW = 60;
        const barGap = (w - 120 - barW * 7) / 6;
        ctx.font = '18px Arial, sans-serif';
        this.challenges.forEach((c, i) => {
            const x = 60 + i * (barW + barGap);
            const maxH = 120;
            const fillH = (this.scores[i] / 100) * maxH;

            // Bar bg
            ctx.fillStyle = '#334466';
            ctx.fillRect(x, barY, barW, maxH);

            // Bar fill
            ctx.fillStyle = '#0891b2';
            ctx.fillRect(x, barY + maxH - fillH, barW, fillH);

            // Icon
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(this.challengeIcons[i], x + barW / 2, barY + maxH + 25);
        });

        // Watermark
        ctx.fillStyle = '#0891b2';
        ctx.font = 'bold 22px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('dopabrain.com/mental-age/', w / 2, h - 30);

        // Download
        const link = document.createElement('a');
        link.download = `mental-age-${this.mentalAge}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        if (typeof gtag !== 'undefined') {
            gtag('event', 'download_image', {
                event_category: 'engagement',
                mental_age: this.mentalAge,
                category: this.category
            });
        }
    }

    _wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (let i = 0; i < words.length; i++) {
            const test = line + words[i] + ' ';
            if (ctx.measureText(test).width > maxWidth && i > 0) {
                ctx.fillText(line.trim(), x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = test;
            }
        }
        ctx.fillText(line.trim(), x, currentY);
    }

    // ========== THEME ==========

    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;

        const savedTheme = localStorage.getItem('app-theme') || 'dark';
        html.setAttribute('data-theme', savedTheme);
        this.updateThemeButton(savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const current = html.getAttribute('data-theme') || 'dark';
                const next = current === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-theme', next);
                localStorage.setItem('app-theme', next);
                this.updateThemeButton(next);
            });
        }
    }

    updateThemeButton(theme) {
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.textContent = theme === 'dark' ? '\u2600\ufe0f' : '\ud83c\udf19';
            btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        }
    }

    // ========== SERVICE WORKER ==========

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            // Parent or project-level SW
        }
    }
}

// Start app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BrainScanApp();
});
