'use strict';


angular.module('angularDemoApp', [
    'ngAnimate',
    'ui.router',
    'ngAria',
    'ngMaterial',
    'tmh.dynamicLocale',
    'angularDemoApp.config',
    'angularDemoApp.common',
    'angularDemoApp.common.services',
    'angularDemoApp.common.components',
    'angularDemoApp.config',
    'angularDemoApp.runtime-config',
    'blocks.logger',
    'blocks.exception',
    'pascalprecht.translate',
    'mdColorPicker',
    'ngMaterialDatePicker',
    'md.data.table',
    'angularDemoApp.trackItem',
    'angularDemoApp.timeline',
    'angularDemoApp.summary',
    'angularDemoApp.settings',
    'angularMoment',
    'ngStorage',
    'angular.filter',
    'nvd3',
    'angular-click-outside',
    'globalServices',
    'filters'
]);

angular.module('angularDemoApp.config', ['blocks.logger',
    'blocks.exception', 'pascalprecht.translate']);
angular.module('angularDemoApp.common', []);
angular.module('angularDemoApp.templates', []);
angular.module('angularDemoApp.common.services', ['angularDemoApp.config', 'ngMaterial', 'ui.router']);
angular.module('angularDemoApp.common.components', ['angularDemoApp.common.services',
    'ngAria', 'ngMaterial', 'blocks.logger',
    'blocks.exception']);
