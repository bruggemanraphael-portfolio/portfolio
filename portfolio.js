import MainController from './controller/MainController.js';
import MainModel from './model/MainModel.js';
import MainView from './view/MainView.js';  

const root = document.getElementById('app');

const model = new MainModel();
await model.ready;

const app = new MainController(
    model,
    new MainView(root)
)
