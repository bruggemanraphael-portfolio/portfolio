export default class Profil {
    #profil;

    constructor(database) {
        this.#profil = database.get_data()?.profil || null;
    }

    get_profil() {
        return this.#profil;
    }

}
