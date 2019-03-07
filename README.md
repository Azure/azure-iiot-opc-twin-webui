# Azure Industrial IoT OPC UA Device Twin Management

A Web Application written in React.js that uses the Azure Industrial IoT OPC UA device services, OPC Registry and OPC Twin.

## Getting started

The Sample User Experience and dependent services are part of our suite of [Azure IoT Industrial components](https://github.com/Azure/azure-iiot-components).

The easiest way to test the Web UI is against the deployed Azure Industrial IoT services. The services can be deployed via the [command line](https://github.com/Azure/azure-iiot-services/tree/master/deploy).

## Setup Dependencies

1. Install [node.js](https://nodejs.org/)
1. For development, you can use your preferred editor
   - [Visual Studio Code](https://code.visualstudio.com/)
   - [Atom](https://atom.io/)
   - [Sublime Text](https://www.sublimetext.com/)
   - or other preferred editor
1. Environment variables required to run the Web UI

   In order to run the Web UI, the environment variables need to be created at least once. More information on configuring environment variables [here](#configuration-and-environment-variables).

   * `REACT_APP_PCS_TWIN_REGISTRY_URL` refers to the url of the registry service and defaults to http://localhost:9042
   * `REACT_APP_PCS_TWIN_SERVICE_URL` refers to the url of the twin service and defaults to http://localhost:9041

### Build, run and test locally

* `cd ~\azure-iiot-opc-twin-webui\`
* `npm install`
* `npm start`: to compile and run the app

### Project Structure

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

## Configuration and Environment variables

The Web UI configuration is stored in [app.config.js](https://github.com/Azure/azure-iiot-opc-twin-webui/blob/master/src/app.config.js).

The configuration files in the repository reference some environment variables that need to be created at least once. 

## Contributing to the solution

Please follow our [contribution guildelines](CONTRIBUTING.md) and the code style conventions.

## References

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

You can find a guide to using it [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

### Core technologies overview

- [ReactJS](https://reactjs.org/)
- [Redux](https://redux.js.org/)
- [Redux-Observable](https://redux-observable.js.org/)
- [RxJs](http://reactivex.io/rxjs/)
- [SASS](http://sass-lang.com/)
- [React-i18nnext](https://github.com/i18next/react-i18next)

## Other Azure Industrial IoT components

* [Azure Industrial IoT Micro Services](https://github.com/Azure/azure-iiot-services)
  * OPC UA Certificate Management service (Coming soon)
* [Azure Industrial IoT OPC UA components](https://github.com/Azure/azure-iiot-opc-ua)
* [Azure Industrial IoT Service API](https://github.com/Azure/azure-iiot-services-api)
* Azure Industrial IoT Edge Modules
  * [OPC Publisher module](https://github.com/Azure/iot-edge-opc-publisher)
  * [OPC Proxy module](https://github.com/Azure/iot-edge-opc-proxy)
  * [OPC Device Twin module](https://github.com/Azure/azure-iiot-opc-twin-module)
