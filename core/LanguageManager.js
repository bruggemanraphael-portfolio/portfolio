import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './i18n/ui_strings.js';

export default class LanguageManager {
    #current_language;

    constructor() {
        this.load_language();
    }

    load_language() {
        const saved_language = localStorage.getItem('language');
        this.#current_language = SUPPORTED_LANGUAGES.includes(saved_language) ? saved_language : DEFAULT_LANGUAGE;
        document.documentElement.setAttribute('lang', this.#current_language);
    }

    set_language(lang) {
        if (!SUPPORTED_LANGUAGES.includes(lang)) {
            return;
        }

        this.#current_language = lang;
        localStorage.setItem('language', lang);
        document.documentElement.setAttribute('lang', lang);
    }

    get_current_language() {
        return this.#current_language;
    }

}
