
OpcTwin App
==================================
## Getting started
1. Install [node.js](https://nodejs.org/)
2. For development, you can use your preferred editor
   - [Visual Studio Code](https://code.visualstudio.com/)
   - [Atom](https://atom.io/)
   - [Sublime Text](https://www.sublimetext.com/)
   - or other preferred editor

### 3. Environment variables required to run the Web UI
In order to run the Web UI, the environment variables need to be created at least once. More information on configuring environment variables [here](#configuration-and-environment-variables).

* `REACT_APP_BASE_SERVICE_URL` = {your-opc-twin-endpoint}

Build, run and test locally
===========================
* `cd ~\azure-iiot-opc-twin-webui\`
* `npm install`
* `npm start`: to compile and run the app

Project Structure
===========================
The Web UI contains the following sections under [src](src):
- `assets`: Contains assets used across the application. These include fonts,
icons, images, etc.
- `components`: Contains all the application react components. These in include
containers and presentational components.
- `services`: Contains the logic for making ajax calls as well as mapping
request/response objects to front end models.
- `store`: Contains all logic related to the redux store.
- `styles`: Contains sass used across the application mixins, theming, variables,
etc.
- `utilities`: Contains helper scripts used across the application.

Contributing to the solution
==============================
Please follow our [contribution guildelines](CONTRIBUTING.md) and the code style conventions.

References
==========
This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find a guide to using it [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Core technologies overview

- [ReactJS](https://reactjs.org/)
- [React-Router v4](https://github.com/ReactTraining/react-router)
- [Redux](https://redux.js.org/)
- [Redux-Observable](https://redux-observable.js.org/)
- [RxJs](http://reactivex.io/rxjs/)
- [SASS](http://sass-lang.com/)
- [React-i18nnext](https://github.com/i18next/react-i18next)

