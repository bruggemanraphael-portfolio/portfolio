import ThemeManager from '../core/ThemeManager.js';
import LanguageManager from '../core/LanguageManager.js';
import { get_ui_strings } from '../core/i18n/ui_strings.js';

(function() {
    // https://dashboard.emailjs.com/admin/account
    // free subscription: 1000 emails/month, 5 email templates, 1 email service
    emailjs.init({
        publicKey: "7NTnHuoEq3ADQqEQf",
    });
})();

export default class MainController {
    #theme_manager = new ThemeManager();
    #language_manager = new LanguageManager();
    #model;
    #view;
    #is_submitting = false;
    #last_submit_at = 0;
    #form_started_at = Date.now();
    #MIN_FILL_TIME_MS = 3000;
    #SUBMIT_COOLDOWN_MS = 30000;
    #selected_category = 'all';

    constructor(model, view) {
        this.#model = model;
        this.#view = view;
        this.init();
    }    

    async init() {
        this.#view.bind_toggle_theme(this.toggle_theme.bind(this));
        this.#view.bind_toggle_language(this.language_handler.bind(this));
        this.#view.bind_event_hamburger_menu();
        this.#view.bind_scroll_reveal();
        this.#view.set_active_nav_button(this.nav_handler.bind(this));
        this.render_content();
        this.#view.form_validation(this.form_handler.bind(this));
        this.#view.scroll_to_page('profil');
    }

    render_content() {
        const lang = this.#language_manager.get_current_language();
        const strings = get_ui_strings(lang);

        this.#view.apply_static_translations(strings);
        this.#view.update_language_buttons(lang);
        this.#view.display_user_profil(this.#model.get_user_profil(lang));
        this.render_projects();
        this.#view.display_experiences(this.#model.get_experiences(lang), this.#model.get_logos());
    }

    language_handler(lang) {
        this.#language_manager.set_language(lang);
        this.render_content();
    }

    render_projects() {
        const lang = this.#language_manager.get_current_language();
        const strings = get_ui_strings(lang);
        const projects = this.#model.get_projects(lang);

        const seen_ids = new Set();
        const categories = [{ id: 'all', label: strings.category_all }];
        projects.forEach((project) => {
            if (project.category_id && !seen_ids.has(project.category_id)) {
                seen_ids.add(project.category_id);
                categories.push({ id: project.category_id, label: project.category });
            }
        });

        this.#view.display_category_filters(categories, this.#selected_category, this.category_filter_handler.bind(this));

        const filtered_projects = this.#selected_category === 'all'
            ? projects
            : projects.filter(project => project.category_id === this.#selected_category);

        this.#view.display_projects(filtered_projects, this.#model.get_logos());
    }

    category_filter_handler(category_id) {
        this.#selected_category = category_id;
        this.render_projects();
    }

    toggle_theme() {
        this.#theme_manager.toggle_theme();
    }

    nav_handler(section_name) {
        this.#view.scroll_to_page(section_name);
    }

    validate_form_data(form_data) {
        const strings = get_ui_strings(this.#language_manager.get_current_language());
        const errors = {};

        const name = form_data?.name || '';
        const email = form_data?.email || '';
        const message = form_data?.message || '';

        if (!name) {
            errors.name = strings.error_name_required;
        } else if (name.length < 2) {
            errors.name = strings.error_name_min;
        } else if (name.length > 80) {
            errors.name = strings.error_name_max;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = strings.error_email_invalid;
        } else if (email.length > 254) {
            errors.email = strings.error_email_max;
        }

        if (!message) {
            errors.message = strings.error_message_required;
        } else if (message.length < 10) {
            errors.message = strings.error_message_min;
        } else if (message.length > 1500) {
            errors.message = strings.error_message_max;
        }

        return {
            is_valid: Object.keys(errors).length === 0,
            errors
        };
    }

    async form_handler(templateParams) {
        const now = Date.now();
        const strings = get_ui_strings(this.#language_manager.get_current_language());
        const submit_labels = { submit: strings.form_submit, submitting: strings.form_submitting };

        if (this.#is_submitting) {
            this.#view.render_message(strings.msg_already_submitting, 'info');
            return;
        }

        const elapsed_fill_time = now - this.#form_started_at;
        if (elapsed_fill_time < this.#MIN_FILL_TIME_MS) {
            this.#view.render_message(strings.msg_too_fast, 'error');
            return;
        }

        if (now - this.#last_submit_at < this.#SUBMIT_COOLDOWN_MS) {
            const remaining_sec = Math.ceil((this.#SUBMIT_COOLDOWN_MS - (now - this.#last_submit_at)) / 1000);
            this.#view.render_message(strings.msg_cooldown(remaining_sec), 'error');
            return;
        }

        if (templateParams.website) {
            this.#last_submit_at = now;
            this.#form_started_at = Date.now();
            this.#view.render_message(strings.msg_honeypot_success, 'success');
            this.#view.reset_form();
            return;
        }

        const validation = this.validate_form_data(templateParams);
        this.#view.render_form_errors(validation.errors);

        if (!validation.is_valid) {
            this.#view.render_message(strings.msg_fix_errors, 'error');
            return;
        }

        const current_datetime = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'long' }).format(new Date());
        const payload = {
            timestamp: current_datetime,
            name: templateParams.name,
            email: templateParams.email,
            message: templateParams.message
        };

        if (!window.emailjs || typeof window.emailjs.send !== 'function') {
            this.#view.render_message(strings.msg_service_unavailable, 'error');
            return;
        }

        this.#is_submitting = true;
        this.#view.set_form_submitting(true, submit_labels);
        this.#view.render_message(strings.msg_sending, 'info');

        try {
            await window.emailjs.send('service_phkqwy2', 'template_8hfaobv', payload);
            this.#last_submit_at = Date.now();
            this.#form_started_at = Date.now();
            this.#view.render_message(strings.msg_success, 'success');
            this.#view.reset_form();
            this.#view.render_form_errors({});
        } catch (error) {
            this.#view.render_message(strings.msg_failure, 'error');
            console.log('FAILED...', error);
        } finally {
            this.#is_submitting = false;
            this.#view.set_form_submitting(false, submit_labels);
        }

    }


}