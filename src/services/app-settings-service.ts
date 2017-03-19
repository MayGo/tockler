import {inject} from 'aurelia-framework';

export class AppSettingsService {
  constructor() {
	  var service = require('electron').remote.getGlobal('BackgroundService').getAppSettingsService();
  }
	
}
