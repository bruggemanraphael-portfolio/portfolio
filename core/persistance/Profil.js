import { StringsHelper } from '../helpers/strings_helper.js';

export default class Profil {
    #profil;

    constructor(database) {
        this.#profil = database.get_data()?.profil || null;
    }

    get_profil(lang = 'fr') {
        if (!this.#profil) {
            return null;
        }

        return {
            ...this.#profil,
            title: StringsHelper.resolveTranslation(this.#profil.title, lang),
            description: StringsHelper.resolveTranslation(this.#profil.description, lang)
        };
    }

}
