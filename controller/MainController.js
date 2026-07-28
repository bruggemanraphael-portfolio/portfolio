import ThemeManager from '../core/ThemeManager.js';

(function() {
    // https://dashboard.emailjs.com/admin/account
    // free subscription: 1000 emails/month, 5 email templates, 1 email service
    emailjs.init({
        publicKey: "7NTnHuoEq3ADQqEQf",
    });
})();

export default class MainController {
    #theme_manager = new ThemeManager();
    #model;
    #view;
    #is_submitting = false;
    #last_submit_at = 0;
    #form_started_at = Date.now();
    #MIN_FILL_TIME_MS = 3000;
    #SUBMIT_COOLDOWN_MS = 30000;

    constructor(model, view) {
        this.#model = model;
        this.#view = view;
        this.init();
    }    

    async init() {
        this.#view.bind_toggle_theme(this.toggle_theme.bind(this));
        this.#view.bind_event_hamburger_menu();
        this.#view.set_active_nav_button(this.nav_handler.bind(this));
        this.#view.display_user_profil(this.#model.get_user_profil());
        this.#view.display_projects(
            this.#model.get_projects(), 
            this.#model.get_logos()
        );
        this.#view.display_recommandations(this.#model.get_recommandations());
        this.#view.form_validation(this.form_handler.bind(this));
        this.#view.scroll_to_page('profil');
    }

    toggle_theme() {
        this.#theme_manager.toggle_theme();
    }

    nav_handler(section_name) {
        this.#view.scroll_to_page(section_name);
    }

    validate_form_data(form_data) {
        const errors = {};

        const name = form_data?.name || '';
        const email = form_data?.email || '';
        const message = form_data?.message || '';

        if (!name) {
            errors.name = 'Le nom est requis.';
        } else if (name.length < 2) {
            errors.name = 'Le nom doit contenir au moins 2 caracteres.';
        } else if (name.length > 80) {
            errors.name = 'Le nom ne peut pas depasser 80 caracteres.';
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Email invalide.';
        } else if (email.length > 254) {
            errors.email = 'L\'email est trop long.';
        }

        if (!message) {
            errors.message = 'Le message est requis.';
        } else if (message.length < 10) {
            errors.message = 'Le message doit contenir au moins 10 caracteres.';
        } else if (message.length > 1500) {
            errors.message = 'Le message ne peut pas depasser 1500 caracteres.';
        }

        return {
            is_valid: Object.keys(errors).length === 0,
            errors
        };
    }

    async form_handler(templateParams) {
        const now = Date.now();

        if (this.#is_submitting) {
            this.#view.render_message('Envoi deja en cours. Merci de patienter.', 'info');
            return;
        }

        const elapsed_fill_time = now - this.#form_started_at;
        if (elapsed_fill_time < this.#MIN_FILL_TIME_MS) {
            this.#view.render_message('Merci de prendre un instant avant d\'envoyer le formulaire.', 'error');
            return;
        }

        if (now - this.#last_submit_at < this.#SUBMIT_COOLDOWN_MS) {
            const remaining_sec = Math.ceil((this.#SUBMIT_COOLDOWN_MS - (now - this.#last_submit_at)) / 1000);
            this.#view.render_message(`Merci d\'attendre ${remaining_sec}s avant un nouvel envoi.`, 'error');
            return;
        }

        if (templateParams.website) {
            this.#last_submit_at = now;
            this.#form_started_at = Date.now();
            this.#view.render_message('Message envoye avec succes.', 'success');
            this.#view.reset_form();
            return;
        }

        const validation = this.validate_form_data(templateParams);
        this.#view.render_form_errors(validation.errors);

        if (!validation.is_valid) {
            this.#view.render_message('Merci de corriger les champs en erreur puis de reessayer.', 'error');
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
            this.#view.render_message('Service email indisponible pour le moment. Veuillez reessayer plus tard.', 'error');
            return;
        }

        this.#is_submitting = true;
        this.#view.set_form_submitting(true);
        this.#view.render_message('Envoi du message...', 'info');

        try {
            await window.emailjs.send('service_phkqwy2', 'template_8hfaobv', payload);
            this.#last_submit_at = Date.now();
            this.#form_started_at = Date.now();
            this.#view.render_message('Message envoye avec succes. Je vous reponds rapidement.', 'success');
            this.#view.reset_form();
            this.#view.render_form_errors({});
        } catch (error) {
            this.#view.render_message('Echec de l\'envoi. Verifiez votre connexion puis reessayez.', 'error');
            console.log('FAILED...', error);
        } finally {
            this.#is_submitting = false;
            this.#view.set_form_submitting(false);
        }

    }


}