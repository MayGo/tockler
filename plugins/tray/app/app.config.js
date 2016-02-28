'use strict';

angular.module('trayApp.config')

  .constant('appConstants', {
    dateFormat: 'dd.MM.yyyy',
    dateTimeFormat: 'dd.MM.yyyy HH:mm',
    modelDateTimeFormat: 'yyyy-MM-ddTHH:mm:ss',
    momentDateTimeFormat: 'YYYY-MM-DDTHH:mm:ss', //moment.js use for date editing
    showMomentDateFormat: 'DD.MM.YYYY',
    showMomentDateTimeFormat: 'DD.MM.YYYY HH:mm'
  });

