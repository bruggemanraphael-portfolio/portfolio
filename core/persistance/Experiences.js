import { StringsHelper } from '../helpers/strings_helper.js';

export default class Experiences {
    #experiences = [];

    constructor(database) {
        this.#experiences = database.get_data()?.Experiences || [];
    }

    get_experiences(lang = 'fr') {
        return this.#experiences.map((experience) => ({
            ...experience,
            title: StringsHelper.resolveTranslation(experience.title, lang),
            description: StringsHelper.resolveTranslation(experience.description, lang)
        }));
    }

    get_experience_by_id(id) {
        return this.#experiences.find(experience => experience.id === id);
    }

}
