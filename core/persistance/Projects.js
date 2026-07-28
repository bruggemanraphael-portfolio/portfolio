export default class Projects {
    #projects = [];

    constructor(database) {
        this.#projects = database.get_data()?.projects || [];
    }

    get_projects() {
        return [...this.#projects];
    }

    get_project_by_id(id) {
        return this.#projects.find(project => project.id === id);
    }

}
