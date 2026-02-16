// Mental Age Test - Main Application
class MentalAgeApp {
    constructor() {
        this.currentQuestion = 0;
        this.answers = []; // stores score values, not option indices
        this.mentalAge = null;
        this.ageCategory = null;
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

    setupEventListeners() {
        // Start button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.addEventListener('click', () => this.startQuiz());

        // Back buttons
        const progressBack = document.getElementById('progress-back');
        const resultBack = document.getElementById('result-back');
        if (progressBack) progressBack.addEventListener('click', () => this.goBack());
        if (resultBack) resultBack.addEventListener('click', () => this.goBack());

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) retryBtn.addEventListener('click', () => this.resetQuiz());

        // Language selector
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLangMenu());
        }

        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                if (lang) this.changeLang(lang);
            });
        });

        // Theme toggle
        this.initTheme();

        // Share buttons
        const shareImageDownload = document.getElementById('share-image-download');
        const shareTwitter = document.getElementById('share-twitter');
        const shareFacebook = document.getElementById('share-facebook');
        const shareCopy = document.getElementById('share-copy');
        if (shareImageDownload) shareImageDownload.addEventListener('click', () => this.downloadImage());
        if (shareTwitter) shareTwitter.addEventListener('click', () => this.shareTwitter());
        if (shareFacebook) shareFacebook.addEventListener('click', () => this.shareFacebook());
        if (shareCopy) shareCopy.addEventListener('click', () => this.shareCopy());

        // Google Analytics
        this.setupGA();
    }

    setupGA() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Mental Age Test',
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

        // Update current screen
        if (this.currentQuestion > 0 && this.ageCategory === null) {
            this.displayQuestion();
        } else if (this.ageCategory) {
            this.displayResult();
        }
    }

    startQuiz() {
        // GA4: test start
        if (typeof gtag !== 'undefined') {
            gtag('event', 'test_start', {
                app_name: 'mental-age',
                content_type: 'test',
                event_category: 'engagement'
            });
        }

        this.showScreen('quiz-screen');
        this.currentQuestion = 0;
        this.answers = [];
        this.mentalAge = null;
        this.ageCategory = null;
        this.displayQuestion();
    }

    displayQuestion() {
        const question = QUIZ_QUESTIONS[this.currentQuestion];

        // Update progress bar
        const progress = ((this.currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('current-question').textContent = this.currentQuestion + 1;

        // Question text
        document.getElementById('question-text').textContent = i18n.t(question.textKey);

        // Generate options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionEl = document.createElement('button');
            optionEl.className = 'option';
            optionEl.textContent = i18n.t(option.textKey);
            optionEl.addEventListener('click', () => this.selectOption(index));
            optionsContainer.appendChild(optionEl);
        });
    }

    selectOption(index) {
        const question = QUIZ_QUESTIONS[this.currentQuestion];
        const score = question.options[index].score;
        this.answers.push(score);
        this.currentQuestion++;

        if (this.currentQuestion < QUIZ_QUESTIONS.length) {
            // Next question
            this.showScreen('quiz-screen');
            setTimeout(() => this.displayQuestion(), 300);
        } else {
            // Show analyzing screen
            this.showAnalyzing();
        }
    }

    showAnalyzing() {
        this.showScreen('analyzing-screen');

        // 2-second analyzing animation, then calculate
        setTimeout(() => {
            this.calculateResult();
        }, 2000);
    }

    calculateResult() {
        // Calculate mental age from answer scores
        this.mentalAge = calculateMentalAge(this.answers);
        this.ageCategory = getAgeCategory(this.mentalAge);

        // GA4: test complete
        if (typeof gtag !== 'undefined') {
            gtag('event', 'test_complete', {
                app_name: 'mental-age',
                event_category: 'engagement',
                mental_age: this.mentalAge,
                age_category: this.ageCategory.id
            });
        }

        // Show result screen
        setTimeout(() => {
            this.showScreen('result-screen');
            this.displayResult();
        }, 500);
    }

    displayResult() {
        const category = this.ageCategory;

        // Mental age number display
        const ageDisplay = document.getElementById('result-age');
        if (ageDisplay) {
            ageDisplay.textContent = this.mentalAge;
        }

        const resultTitle = document.getElementById('result-title');
        if (resultTitle) resultTitle.textContent = `${category.emoji} ${i18n.t(category.nameKey)}`;

        const resultTagline = document.getElementById('result-tagline');
        if (resultTagline) resultTagline.textContent = i18n.t(category.taglineKey);

        // Description
        const resultDescription = document.getElementById('result-description');
        if (resultDescription) {
            resultDescription.innerHTML = `<p>${i18n.t(category.descriptionKey)}</p>`;
        }

        // Traits
        const traitsList = document.getElementById('traits-list');
        if (traitsList) {
            traitsList.innerHTML = '';
            category.traitsKey.forEach(key => {
                const li = document.createElement('li');
                li.textContent = i18n.t(key);
                traitsList.appendChild(li);
            });
        }

        // Tips
        const tipsList = document.getElementById('tips-list');
        if (tipsList) {
            tipsList.innerHTML = '';
            category.tipsKey.forEach(key => {
                const li = document.createElement('li');
                li.textContent = i18n.t(key);
                tipsList.appendChild(li);
            });
        }

        // Famous people
        const famousPeople = document.getElementById('famous-people');
        if (famousPeople) {
            famousPeople.textContent = i18n.t(category.famousKey);
        }

        // Recommended apps
        this.displayRecommendedApps();

        // Confetti effect
        this.createConfetti();
    }

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

    displayRecommendedApps() {
        const list = document.getElementById('recommended-list');
        if (!list) return;
        list.innerHTML = '';

        RECOMMENDED_APPS.forEach(app => {
            const card = document.createElement('div');
            card.className = 'app-card';
            card.onclick = () => this.goToApp(app.id);

            const emoji = document.createElement('span');
            emoji.className = 'app-emoji';
            emoji.textContent = app.emoji;

            const name = document.createElement('div');
            name.className = 'app-name';
            name.textContent = i18n.t(app.nameKey);

            card.appendChild(emoji);
            card.appendChild(name);
            list.appendChild(card);
        });
    }

    goToApp(appId) {
        window.location.href = `../${appId}/index.html`;
    }

    // --- Sharing methods ---

    shareTwitter() {
        const category = this.ageCategory;
        const categoryName = i18n.t(category.nameKey);
        const shareTemplate = i18n.t('share.twitterText') || 'My mental age is {age}! I got {type} {emoji}. What is your mental age?';
        const text = shareTemplate
            .replace('{age}', this.mentalAge)
            .replace('{type}', categoryName)
            .replace('{emoji}', category.emoji);
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
        const category = this.ageCategory;
        const categoryName = i18n.t(category.nameKey);
        const copyTemplate = i18n.t('share.copyText') || 'My mental age is {age}! I got {type} {emoji}. {url}';
        const text = copyTemplate
            .replace('{age}', this.mentalAge)
            .replace('{type}', categoryName)
            .replace('{emoji}', category.emoji)
            .replace('{url}', window.location.href);

        navigator.clipboard.writeText(text).then(() => {
            const msg = i18n.t('message.copy_success') || 'Copied!';
            alert(msg);

            if (typeof gtag !== 'undefined') {
                gtag('event', 'share', { method: 'copy', mental_age: this.mentalAge });
            }
        }).catch(() => {
            const msg = i18n.t('message.copy_error') || 'Copy failed. Please try again.';
            alert(msg);
        });
    }

    downloadImage() {
        const canvas = document.getElementById('result-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const category = this.ageCategory;
        const w = canvas.width;
        const h = canvas.height;

        // Background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#1a1a2e');
        bgGrad.addColorStop(1, '#16213e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Header area - gradient accent
        const headerGrad = ctx.createLinearGradient(0, 0, w, 0);
        headerGrad.addColorStop(0, '#667eea');
        headerGrad.addColorStop(1, '#764ba2');
        ctx.fillStyle = headerGrad;
        ctx.fillRect(0, 0, w, 8);

        // "My Mental Age Is..." text
        ctx.fillStyle = '#a0a0c0';
        ctx.font = '600 32px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(i18n.t('share.canvasSubtitle') || 'My Mental Age Is...', w / 2, 80);

        // Large age number with gradient effect (simulated with solid color)
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 160px Arial, sans-serif';
        ctx.fillText(String(this.mentalAge), w / 2, 260);

        // Category emoji
        ctx.font = '72px Arial, sans-serif';
        ctx.fillText(category.emoji, w / 2, 360);

        // Category name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px Arial, sans-serif';
        ctx.fillText(i18n.t(category.nameKey), w / 2, 430);

        // Tagline
        ctx.fillStyle = '#a0a0c0';
        ctx.font = '24px Arial, sans-serif';
        const tagline = i18n.t(category.taglineKey);
        // Word wrap tagline if needed
        this.wrapCanvasText(ctx, tagline, w / 2, 475, w - 120, 30);

        // Divider line
        ctx.strokeStyle = '#334466';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(80, 520);
        ctx.lineTo(w - 80, 520);
        ctx.stroke();

        // Age range
        ctx.fillStyle = '#8888aa';
        ctx.font = '22px Arial, sans-serif';
        const rangeText = (i18n.t('result.ageRange') || 'Age Range') + ': ' + category.range;
        ctx.fillText(rangeText, w / 2, 560);

        // Watermark
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 22px Arial, sans-serif';
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
                age_category: category.id
            });
        }
    }

    /**
     * Helper: word wrap text on canvas
     */
    wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line.trim(), x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x, currentY);
    }

    // --- Navigation ---

    goBack() {
        this.resetQuiz();
    }

    resetQuiz() {
        this.currentQuestion = 0;
        this.answers = [];
        this.mentalAge = null;
        this.ageCategory = null;
        this.showScreen('intro-screen');
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show selected screen
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');

        // Scroll to top
        window.scrollTo(0, 0);
    }

    // --- Theme ---

    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;

        // Load saved theme preference (dark mode first)
        const savedTheme = localStorage.getItem('app-theme') || 'dark';
        html.setAttribute('data-theme', savedTheme);
        this.updateThemeButton(savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = html.getAttribute('data-theme') || 'dark';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('app-theme', newTheme);
                this.updateThemeButton(newTheme);
            });
        }
    }

    updateThemeButton(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '\u2600\ufe0f' : '\ud83c\udf19';
            themeToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        }
    }

    // --- Service Worker ---

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            // Parent or project-level SW can be registered here
        }
    }
}

// Start app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MentalAgeApp();
});
