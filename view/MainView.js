import { StringsHelper } from '../core/helpers/strings_helper.js';

export default class MainView {
    #root;
    
    constructor(root) {
        this.#root = root;
        // document.addEventListener('mousemove', (event) => {
        //     document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`);
        //     document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`);
        // });
    }

    bind_event_hamburger_menu() {
        const hamburger = this.#root.querySelector('.hamburger');
        const menu = this.#root.querySelector('nav ul');

        if (!hamburger || !menu) {
            return;
        }

        const close_menu = () => {
            menu.classList.remove('menu_mobile');
            hamburger.classList.remove('is-active');
        };
        
        hamburger.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const is_open = menu.classList.toggle('menu_mobile');
            hamburger.classList.toggle('is-active', is_open);
        });

        document.addEventListener('click', (event) => {
            const target = event.target;
            const clicked_hamburger = target.closest('.hamburger');
            const clicked_menu = menu.contains(target);

            if (!menu.classList.contains('menu_mobile')) {
                return;
            }

            if (!clicked_hamburger && !clicked_menu) {
                close_menu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menu.classList.contains('menu_mobile')) {
                close_menu();
            }
        });
    }
    
    bind_toggle_theme(handler) {  
        let current_theme = localStorage.getItem('theme') || 'light';

        this.#root.addEventListener('click', (event) => {
            if (event.target.classList.contains('toggle-theme-btn')) {
                event.preventDefault();
                if (handler) handler();
                current_theme = current_theme === 'dark' ? 'light' : 'dark';
                localStorage.setItem('theme', current_theme);
                this.update_theme_button(current_theme);
            }
        });

        this.update_theme_button(current_theme);
    }

    update_theme_button(current_theme) {
        const header = this.#root.querySelector('div.header');
        if (header) {
            const existing_btn = header.querySelector('.toggle-theme-btn');
            if (existing_btn) {
                existing_btn.textContent = current_theme === 'dark' ? 'light_mode' : 'dark_mode';
            }
        }
    }

    set_active_nav_button(handler) {
        this.#root.querySelectorAll('nav a').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                if (handler) handler(button.getAttribute('href').substring(1));

                const menu = this.#root.querySelector('nav ul');
                const hamburgers = this.#root.querySelectorAll('.hamburger');
                if (menu) {
                    menu.classList.remove('menu_mobile');
                }
                hamburgers.forEach((item) => item.classList.remove('is-active'));
            });
        });
    }

    scroll_to_page(section_name) {
        if (!section_name) {
            return;
        }

        const hash = `#${section_name}`;
        if (window.location.hash !== hash) {
            window.location.hash = hash;
        }
    }

    display_user_profil(profil) {
        const introduction_div = this.#root.querySelector('.introduction');
        const safeName = StringsHelper.escapeHTML(profil?.name);
        const safeTitle = StringsHelper.escapeHTML(profil?.title);
        const safeDescription = StringsHelper.escapeHTML(profil?.description);
        const safeImage = StringsHelper.escapeHTML(StringsHelper.sanitizeURL(profil?.image, ['http:', 'https:']));

        introduction_div.innerHTML = `
            <div>   
                <div class="head">
                    <h2 class="name">${safeName}</h2>
                    <h6 class="role">${safeTitle}</h6>
                </div>
                <p class="description">"${safeDescription}"</p>
            </div>
        `;
    }

    display_projects(projects, logos) {
        const projects_container = this.#root.querySelector('.projects');
        projects_container.innerHTML = '';
       
        projects.forEach(project => {
            const project_item = this.create_project_item(project, logos);
            projects_container.innerHTML += project_item;
        });
    }

    create_project_item(project, logos) {
        let tech = project.technologies.map(tech => tech.toLowerCase());
        const stack = this.get_stack(tech, logos);
        const safeTitle = StringsHelper.escapeHTML(project?.title);
        const safeDescription = StringsHelper.escapeHTML(project?.description);
        const safeLink = StringsHelper.escapeHTML(StringsHelper.sanitizeURL(project?.link, ['http:', 'https:']));
        
        return `
            <div class="project">
                <h3 class="title">${safeTitle}</h3>
                ${stack}
                <p class="description">${safeDescription}</p>
                <a href="${safeLink}">Voir le projet</a>
            </div>`;
    }  

    get_stack(techs, logos) {
        const stack = document.createElement('span');
        techs.forEach(tech => {
            logos.forEach(logo => {
                if (logo.name.toLowerCase() === tech) {
                    const safeSymbolPath = StringsHelper.sanitizeURL(logo?.symbol_path, ['http:', 'https:']);
                    if (safeSymbolPath === '#') {
                        return;
                    }

                    let img = document.createElement('img');
                        img.classList.add('mark');
                        img.setAttribute('src', safeSymbolPath);
                        img.setAttribute('alt', `${StringsHelper.escapeHTML(tech)} logo`);
                    stack.appendChild(img);
                }
            });
        });
        return stack.outerHTML;
    }
    
    form_validation(handler) {
        const form_data = this.#root.querySelector('#contact-form');
        const nameInput = form_data.querySelector('input[name="name"]');
        const emailInput = form_data.querySelector('input[name="email"]');
        const messageInput = form_data.querySelector('textarea[name="message"]');
        const websiteInput = form_data.querySelector('input[name="website"]');
    
        form_data.addEventListener('submit', (event) => {
            event.preventDefault();
            if (handler) {
                handler({
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    message: messageInput.value.trim(),
                    website: websiteInput ? websiteInput.value.trim() : ''
                });
            }
        });
    }

    set_form_submitting(isSubmitting) {
        const submitButton = this.#root.querySelector('#contact-form button[type="submit"]');
        if (!submitButton) {
            return;
        }

        submitButton.disabled = isSubmitting;
        submitButton.textContent = isSubmitting ? 'Envoi en cours...' : 'Envoyer';
    }

    reset_form() {
        const form = this.#root.querySelector('#contact-form');
        if (form) {
            form.reset();
        }
    }

    render_form_errors(errors = {}) {
        const fields = ['name', 'email', 'message'];
        fields.forEach((field) => {
            const container = this.#root.querySelector(`.${field}`);
            if (!container) {
                return;
            }
            const errorMessage = container.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = errors[field] || '';
            }
        });
    }
    
    render_message(message, type = 'info') {
        const errorMessage = this.#root.querySelector('#contact-form .form-message');
        if (!errorMessage) {
            return;
        }

        errorMessage.classList.remove('success-message', 'error-message', 'info-message');
        if (type === 'success') {
            errorMessage.classList.add('success-message');
        } else if (type === 'error') {
            errorMessage.classList.add('error-message');
        } else {
            errorMessage.classList.add('info-message');
        }

        errorMessage.textContent = message;
    }
}