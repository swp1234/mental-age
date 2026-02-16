// Mental Age Test - i18n Module
// Wrapped in try-catch IIFE for FOUC prevention
;(function () {
    try {
        class I18n {
            constructor() {
                this.translations = {};
                this.supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'id', 'tr', 'de', 'fr', 'hi', 'ru'];
                this.currentLang = this.detectLanguage();
                this.isLoading = false;
            }

            detectLanguage() {
                // Check localStorage for saved preference
                const saved = localStorage.getItem('preferredLanguage');
                if (saved && this.supportedLanguages.includes(saved)) {
                    return saved;
                }

                // Detect browser language
                const browserLang = navigator.language.split('-')[0].toLowerCase();
                if (this.supportedLanguages.includes(browserLang)) {
                    return browserLang;
                }

                // Default: Korean
                return 'ko';
            }

            async loadTranslations(lang) {
                if (this.isLoading) return;

                try {
                    this.isLoading = true;

                    if (this.translations[lang]) {
                        this.isLoading = false;
                        return this.translations[lang];
                    }

                    const response = await fetch(`js/locales/${lang}.json`);
                    if (!response.ok) {
                        throw new Error(`Failed to load language: ${lang}`);
                    }

                    const data = await response.json();
                    this.translations[lang] = data;
                    this.isLoading = false;
                    return data;
                } catch (error) {
                    console.error('Error loading translations:', error);
                    this.isLoading = false;
                    // Fallback: Korean
                    if (lang !== 'ko') {
                        return this.loadTranslations('ko');
                    }
                }
            }

            t(key) {
                const keys = key.split('.');
                let value = this.translations[this.currentLang];

                if (!value) {
                    return key;
                }

                for (const k of keys) {
                    if (value && typeof value === 'object' && k in value) {
                        value = value[k];
                    } else {
                        return key;
                    }
                }

                return value || key;
            }

            async setLanguage(lang) {
                if (!this.supportedLanguages.includes(lang)) {
                    console.warn(`Unsupported language: ${lang}`);
                    return;
                }

                this.currentLang = lang;
                localStorage.setItem('preferredLanguage', lang);
                await this.loadTranslations(lang);
                this.updateUI();
                this.updateLangButtons();
            }

            updateUI() {
                // Update all elements with data-i18n attribute
                document.querySelectorAll('[data-i18n]').forEach(element => {
                    const key = element.getAttribute('data-i18n');
                    const text = this.t(key);

                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        if (element.placeholder) {
                            element.placeholder = text;
                        }
                    } else {
                        element.textContent = text;
                    }
                });
            }

            updateLangButtons() {
                document.querySelectorAll('.lang-option').forEach(btn => {
                    if (btn.getAttribute('data-lang') === this.currentLang) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }

            getCurrentLanguage() {
                return this.currentLang;
            }

            getLanguageName(lang) {
                const names = {
                    ko: '\ud55c\uad6d\uc5b4',
                    en: 'English',
                    ja: '\u65e5\u672c\u8a9e',
                    zh: '\u4e2d\u6587',
                    es: 'Espa\u00f1ol',
                    pt: 'Portugu\u00eas',
                    id: 'Bahasa Indonesia',
                    tr: 'T\u00fcrk\u00e7e',
                    de: 'Deutsch',
                    fr: 'Fran\u00e7ais',
                    hi: '\u0939\u093f\u0928\u094d\u0926\u0940',
                    ru: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439'
                };
                return names[lang] || lang;
            }

            async init() {
                await this.loadTranslations(this.currentLang);
                this.updateUI();
                this.updateLangButtons();
            }
        }

        // Create global i18n instance
        window.i18n = new I18n();
    } catch (e) {
        console.warn('i18n initialization failed:', e.message);
    }
})();
