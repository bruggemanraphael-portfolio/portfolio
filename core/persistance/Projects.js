import { StringsHelper } from '../helpers/strings_helper.js';

export default class Projects {
    #projects = [];

    constructor(database) {
        this.#projects = database.get_data()?.projects || [];
    }

    get_projects(lang = 'fr') {
        return this.#projects.map((project) => ({
            ...project,
            category: StringsHelper.resolveTranslation(project.category, lang),
            title: StringsHelper.resolveTranslation(project.title, lang),
            description: StringsHelper.resolveTranslation(project.description, lang)
        }));
    }

    get_project_by_id(id) {
        return this.#projects.find(project => project.id === id);
    }

}
