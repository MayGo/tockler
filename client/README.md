# Solar Panel Dashboard

# Made with

- [Webpack](https://webpack.github.io/) and [Typescript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/) and [Redux](http://redux.js.org/)
- [Recharts](http://recharts.org/) 
- [Material UI](http://www.material-ui.com/) 

## Data

* Solar Panel data is mocked
* * Vattage: It fluctuates between 200-250v
* * Woltage: Fluctuates between 20-800w
* Weather forecast uses data from PlanetOs API
* * Visible Diffuse Downward Solar Flux
* * Sky cloud coverage

## TODO

* Remove whitespace from Charts bottom
* Make formatter for W/kW/mW
* Fix tests
* Solar Panel mock data should fluctuate realistically

## Screenshots

![1280px](https://github.com/MayGo/solar-panel-dashboard/raw/master/screenshots/1280px.png "1280px")
![iPad](https://github.com/MayGo/solar-panel-dashboard/raw/master/screenshots/ipad.png "ipad")
![iPhone](https://github.com/MayGo/solar-panel-dashboard/raw/master/screenshots/iphone.png "iphone")


## Configuring

location: src/env-local-config.ts

### Variables
* planetOsApiUrl - https://planetos.com  api url
* apiKey - https://planetos.com api key

## How to run

* Run `git clone https://github.com/MayGo/solar-panel-dashboard.git`
* If you don't have yarn installed, download it [here](https://yarnpkg.com/pt-BR/docs/install) (this repo uses some yarn-specific features). 
* Run `yarn install`
* Run `yarn start-dev-server`
