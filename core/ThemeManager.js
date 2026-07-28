export default class ThemeManager {
    #current_theme;
    #transition_timeout = null;
    
    constructor() {
        this.load_theme();
    }

    load_theme() {
        const saved_theme = localStorage.getItem('theme');
        this.#current_theme = saved_theme ? saved_theme : 'dark';
        document.documentElement.setAttribute('data-theme', this.#current_theme);
    }

    toggle_theme() {
        const root = document.documentElement;

        if (this.#transition_timeout) {
            clearTimeout(this.#transition_timeout);
        }

        root.classList.add('theme-transition');
        this.#current_theme = this.#current_theme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', this.#current_theme);
        localStorage.setItem('theme', this.#current_theme);

        this.#transition_timeout = setTimeout(() => {
            root.classList.remove('theme-transition');
            this.#transition_timeout = null;
        }, 650);
    }

    get_current_theme() { 
        return this.#current_theme;
    }

}
