'use strict';

angular
  .module('angularDemoApp')
  .factory('FormUtils',
    function ($anchorScroll, $location, logger) {

      /**
       * focus-invalid-field-id - if this attribute is given to invalid input then input with this id is focused
       */
      var focusFirstInvalidField = function () {
        var invalidElements = angular.element.find('.ng-invalid:not(form)');

        if (invalidElements.length > 0) {

          var id = angular.element(invalidElements[0]).attr('focus-invalid-field-id') || invalidElements[0].id;
          logger.debug('Focus first invalid field with id: ' + id, invalidElements);
          $anchorScroll(id);
          if (id) {
            angular.element('#' + id).focus();
          } else {
            invalidElements[0].focus();
          }

        }
      };

      var focusField = function (element) {
        var id = element.id;
        if (!id) {
          logger.error('Can not focus field: no id', element);
          return;
        }

        logger.debug('Focus field with id:' + id);
        $anchorScroll(id);
        element.focus();
      };

      var blurField = function (element) {
        var id = element.id;
        if (!id) {
          logger.error('Can not focus field: no id', element);
          return;
        }

        logger.debug('Focus field with id:' + id);
        element.blur();
      };

      var nameFromModelName = function (modelName) {
        var nameParts = modelName.split('.');

        var name = '';

        if (nameParts.length > 3) {
          name = nameParts[nameParts.length - 2] + '.' + nameParts[nameParts.length - 1];
        } else if (nameParts.length > 1) {
          name = nameParts[nameParts.length - 1];
        } else {
          name = nameParts[0];
        }

        return name;
      };

      return {
        focusFirstInvalidField: focusFirstInvalidField,
        focusField: focusField,
        nameFromModelName: nameFromModelName,
        blurField: blurField
      };
    }
  );
