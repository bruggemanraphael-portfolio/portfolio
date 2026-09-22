import ProjectsData from '../core/persistance/Projects.js';
import ProfilData from '../core/persistance/Profil.js';
import LogosData from '../core/persistance/Logos.js';
import ExperiencesData from '../core/persistance/Experiences.js';
import Database from '../core/persistance/Database.js';

export default class MainModel {
    #DATA_PATH = './data/datas.json';
    #database = new Database(this.#DATA_PATH);

    projectsData = null;
    profilData = null;
    logosData = null;
    experiencesData = null;
    ready;

    constructor() {  
        this.ready = this.init();
    }

    async init() {
        await this.#database.load_data();

        this.projectsData = new ProjectsData(this.#database);
        this.profilData = new ProfilData(this.#database);
        this.logosData = new LogosData(this.#database);
        this.experiencesData = new ExperiencesData(this.#database);
    }

    get_user_profil(lang = 'fr') {
        return this.profilData?.get_profil(lang) || null;
    }

    get_projects(lang = 'fr') {
        return this.projectsData?.get_projects(lang) || [];
    }

    get_project_by_id(id) {
        return this.projectsData?.get_project_by_id(id) || null;
    }

    get_logos() {
        return this.logosData?.get_logos() || [];
    }

    get_experiences(lang = 'fr') {
        return this.experiencesData?.get_experiences(lang) || [];
    }

}


    