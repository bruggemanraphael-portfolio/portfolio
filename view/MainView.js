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
        const backdrop = this.#root.querySelector('.mobile-menu-backdrop');

        if (!hamburger || !menu) {
            return;
        }

        const close_menu = () => {
            menu.classList.remove('menu_mobile');
            hamburger.classList.remove('is-active');
            if (backdrop) backdrop.classList.remove('is-active');
        };
        
        hamburger.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const is_open = menu.classList.toggle('menu_mobile');
            hamburger.classList.toggle('is-active', is_open);
            if (backdrop) backdrop.classList.toggle('is-active', is_open);
        });

        if (backdrop) {
            backdrop.addEventListener('click', close_menu);
        }

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

                const btn = event.target;
                btn.classList.remove('theme-icon-animate');
                void btn.offsetWidth;
                btn.classList.add('theme-icon-animate');
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

    bind_toggle_language(handler) {
        this.#root.querySelectorAll('.lang-btn').forEach((button) => {
            button.addEventListener('click', () => {
                if (handler) handler(button.dataset.lang);
            });
        });
    }

    update_language_buttons(current_lang) {
        this.#root.querySelectorAll('.lang-btn').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.lang === current_lang);
        });
    }

    apply_static_translations(strings) {
        this.#root.querySelectorAll('[data-i18n]').forEach((element) => {
            const key = element.dataset.i18n;
            const value = strings?.[key];
            if (typeof value !== 'string') {
                return;
            }
            element.innerHTML = value;
        });
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

    bind_scroll_reveal() {
        if (!('IntersectionObserver' in window)) {
            return;
        }

        const targets = this.#root.querySelectorAll('.wrapper-container > div');
        targets.forEach((target) => target.classList.add('reveal-pending'));

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        targets.forEach((target) => observer.observe(target));
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

        this.display_profile_watermark(profil);
    }

    display_experiences(experiences, logos = []) {
        const experiences_container = this.#root.querySelector('.experiences');
        if (!experiences_container) {
            return;
        }

        experiences_container.innerHTML = '';

        experiences.forEach((experience, index) => {
            const experience_item = this.create_experience_item(experience, logos, index);
            experiences_container.innerHTML += experience_item;
        });
    }

    create_experience_item(experience, logos = [], index = 0) {
        const safeTitle = StringsHelper.escapeHTML(experience?.title);
        const safeCompany = StringsHelper.escapeHTML(experience?.company);
        const safeDuration = StringsHelper.escapeHTML(experience?.duration);
        const safeDescription = StringsHelper.escapeHTML(experience?.description);
        const stack = this.get_stack(experience?.stack || [], logos);

        return `
            <div class="experience" style="--i: ${index};">
                <h3 class="title">${safeTitle}</h3>
                <h6 class="company">${safeCompany}</h6>
                <span class="duration">${safeDuration}</span>
                <p class="description">${safeDescription}</p>
                ${stack}
            </div>`;
    }

    display_profile_watermark(profil) {
        const watermark = this.#root.querySelector('.profile-watermark');
        if (!watermark) {
            return;
        }

        const safeName = StringsHelper.escapeHTML(profil?.name);
        const email = profil?.contact?.email;
        const phone = profil?.contact?.phone;
        const safeEmail = StringsHelper.escapeHTML(email);
        const safePhone = StringsHelper.escapeHTML(phone);
        const emailHref = email ? StringsHelper.escapeHTML(StringsHelper.sanitizeURL(`mailto:${email}`, ['mailto:'])) : '#';
        const phoneHref = phone ? StringsHelper.escapeHTML(StringsHelper.sanitizeURL(`tel:${phone.replace(/[^\d+]/g, '')}`, ['tel:'])) : '#';
        const linkedinHref = StringsHelper.escapeHTML(StringsHelper.sanitizeURL(profil?.contact?.linkedin, ['http:', 'https:']));
        const githubHref = StringsHelper.escapeHTML(StringsHelper.sanitizeURL(profil?.contact?.github, ['http:', 'https:']));

        watermark.innerHTML = `
            <span class="watermark-name">${safeName}</span>
            ${email ? `<a class="watermark-contact" href="${emailHref}">${safeEmail}</a>` : ''}
            ${phone ? `<a class="watermark-contact" href="${phoneHref}">${safePhone}</a>` : ''}
            ${profil?.contact?.linkedin ? `<a class="watermark-contact" href="${linkedinHref}" target="_blank" rel="noopener noreferrer">${linkedinHref}</a>` : ''}
            ${profil?.contact?.github ? `<a class="watermark-contact" href="${githubHref}" target="_blank" rel="noopener noreferrer">${githubHref}</a>` : ''}
        `;
    }

    display_projects(projects, logos) {
        const projects_container = this.#root.querySelector('.projects');
        projects_container.classList.add('is-fading');
        projects_container.innerHTML = '';
       
        projects.forEach((project, index) => {
            const project_item = this.create_project_item(project, logos, index);
            projects_container.innerHTML += project_item;
        });

        requestAnimationFrame(() => {
            requestAnimationFrame(() => projects_container.classList.remove('is-fading'));
        });
    }

    display_category_filters(categories, active_category_id, handler) {
        const filters_container = this.#root.querySelector('.category-filters');
        if (!filters_container) {
            return;
        }

        filters_container.innerHTML = categories.map(category => {
            const safeLabel = StringsHelper.escapeHTML(category.label);
            const safeId = StringsHelper.escapeHTML(category.id);
            const is_active = category.id === active_category_id ? ' is-active' : '';
            return `<button type="button" class="category-filter-btn${is_active}" data-category="${safeId}">${safeLabel}</button>`;
        }).join('');

        filters_container.querySelectorAll('.category-filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                if (handler) handler(button.dataset.category);
            });
        });
    }

    create_project_item(project, logos, index = 0) {
        const stack = this.get_stack(project.technologies, logos);
        const safeTitle = StringsHelper.escapeHTML(project?.title);
        const safeDescription = StringsHelper.escapeHTML(project?.description);
        const safeCategory = StringsHelper.escapeHTML(project?.category);
        const projectLink = StringsHelper.escapeHTML(StringsHelper.sanitizeURL(project?.link, ['http:', 'https:']));
        const codeLink = StringsHelper.escapeHTML(StringsHelper.sanitizeURL(project?.github, ['http:', 'https:']));
        
        return `
            <div class="project" style="--i: ${index};">
                <span class="category-engraved">${safeCategory}</span>
                <h3 class="title">${safeTitle}</h3>
                ${stack}
                <p class="description">${safeDescription}</p>
                <div class="links">
                    <a href="${projectLink}" target="_blank" rel="noopener noreferrer" aria-label="Voir le projet ${safeTitle}" title="Voir le projet">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        <span class="sr-only">Voir le projet</span>
                    </a>

                    <a href="${codeLink}" target="_blank" rel="noopener noreferrer" aria-label="Voir le code de ${safeTitle}" title="Voir le code">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1-.01-1.96-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.04.78 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
                        <span class="sr-only">Voir le code</span>
                    </a>
                </div>
            </div>`;
    }  

    get_stack(techs, logos) {
        const stack = document.createElement('span');
        stack.classList.add('stack');
        techs.forEach(tech => {
            const normalized_tech = tech.toLowerCase();
            const logo = logos.find(candidate => normalized_tech.includes(candidate.name.toLowerCase()));

            if (!logo) {
                return;
            }

            const safeSymbolPath = StringsHelper.sanitizeURL(logo?.symbol_path, ['http:', 'https:']);
            if (safeSymbolPath === '#') {
                return;
            }

            const safeTechLabel = StringsHelper.escapeHTML(tech);

            let img = document.createElement('img');
                img.classList.add('mark');
                img.setAttribute('src', safeSymbolPath);
                img.setAttribute('alt', `${safeTechLabel} logo`);
                img.setAttribute('title', safeTechLabel);

            let label = document.createElement('span');
                label.classList.add('mark-label');
                label.textContent = safeTechLabel;

            let item = document.createElement('span');
                item.classList.add('mark-item');
                item.appendChild(img);
                item.appendChild(label);

            stack.appendChild(item);
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

    set_form_submitting(isSubmitting, labels = {}) {
        const submitButton = this.#root.querySelector('#contact-form button[type="submit"]');
        if (!submitButton) {
            return;
        }

        submitButton.disabled = isSubmitting;
        submitButton.textContent = isSubmitting
            ? (labels.submitting || 'Envoi en cours...')
            : (labels.submit || 'Envoyer');
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
        errorMessage.classList.toggle('is-visible', Boolean(message));
    }
}