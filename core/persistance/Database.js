export default class Database {
    static #instance = null;
    #data;  
    #data_path;

    constructor(data_path) {
        if (Database.#instance) {
            return Database.#instance;
        }
        this.#data_path = data_path;    
        Database.#instance = this;
    }

    async load_data() {
        try {
            const response = await fetch(this.#data_path);
            this.#data = await response.json();
            console.log('Data loaded successfully:', this.#data);
        } catch (error) {
            console.error('Error loading data:', error);
            this.#data = null;
        }
    }

    get_data() {
        if (!this.#data) {
            console.warn('Data not loaded yet. Call load_data() first.');
            return null;
        }
        return this.#data;
    }  
}