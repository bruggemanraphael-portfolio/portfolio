export default class Logos {
    #logos;

    constructor(database) {
        this.#logos = database.get_data()?.logos || [];
    }

    get_logos() {
        return this.#logos;
    }

    
}
