'use strict';

angular
  .module('angularDemoApp')
  .factory('materialElementModifier',
    function (logger) {
      /**
       * @ngdoc function
       * @name materialElementModifier#makeValid
       * @methodOf materialElementModifier
       *
       * @description
       * Makes an element appear valid by apply custom styles and child elements.
       *
       * @param {Element} el - The input control element that is the target of the validation.
       */
      var makeValid = function (el) {
        var mdInputContainerEl = findMdInputContainerElement(el);
        if (!mdInputContainerEl) {
          logger.error('Angular-auto-validate: invalid material form structure elements must be wrapped by a md-input-container element', el);
          return;
        }

        resetInput(mdInputContainerEl);
      };

      /**
       * @ngdoc function
       * @name materialElementModifier#makeInvalid
       * @methodOf materialElementModifier
       *
       * @description
       * Makes an element appear invalid by apply custom styles and child elements.
       *
       * @param {Element} el - The input control element that is the target of the validation.
       * @param {String} errorMsg - The validation error message to display to the user.
       */
      var makeInvalid = function (el, errorMsg) {
        var helpTextEl = angular.element('<span class="input-error-msg">' + errorMsg + '</span>');

        var mdInputContainerEl = findMdInputContainerElement(el);
        if (!mdInputContainerEl) {
          logger.error('Angular-auto-validate: invalid material form structure elements must be wrapped by a md-input-container element', el);
          return;
        }

        resetInput(mdInputContainerEl);
        insertTo(mdInputContainerEl, helpTextEl);
      };

      /**
       * @ngdoc function
       * @name materialElementModifier#makeDefault
       * @methodOf materialElementModifier
       *
       * @description
       * Makes an element appear in its default visual state.
       *
       * @param {Element} el - The input control element that is the target of the validation.
       */
      var makeDefault = function (el) {
        var mdInputContainerEl = findMdInputContainerElement(el);
        if (!mdInputContainerEl) {

          // logger.error('Angular-auto-validate: invalid material form structure elements must be wrapped by a md-input-container element', el);
          return;
        }

        resetInput(mdInputContainerEl);
      };

      var resetInput = function (el) {
        angular.forEach(el.find('span'), function (spanEl) {
          spanEl = angular.element(spanEl);
          if (spanEl.hasClass('input-error-msg')) {
            spanEl.remove();
          }
        });
      };

      var findMdInputContainerElement = function (el) {
        return findElementAsc(el, 'MD-INPUT-CONTAINER') || findElementAsc(el, 'DIV');
      };

      var insertTo = function (referenceNode, newNode) {
        referenceNode[0].appendChild(newNode[0]);
      };

      var findElementAsc = function (el, tag) {
        var returnEl;
        var parent = el;

        for (var i = 0; i <= 10; i += 1) {
          var currentEl = parent[0] || parent;
          if (currentEl !== undefined && currentEl.nodeName === tag) {
            returnEl = parent;
            break;
          } else if (parent !== undefined) {
            parent = parent.parent();
          }
        }

        return returnEl;
      };

      return {
        makeValid: makeValid,
        makeInvalid: makeInvalid,
        makeDefault: makeDefault,
        key: 'materialModifierKey'
      };
    }
  );
