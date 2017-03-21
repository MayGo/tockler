
define("materialize-css/js/materialize.amd", ["jquery"], function(){});
;define('materialize-css', ['materialize-css/js/materialize.amd'], function (main) { return main; });

define("materialize-css/js/materialize.amd", ["jquery"], function(){});
;define('materialize-css', ['materialize-css/js/materialize.amd'], function (main) { return main; });

define('aurelia-materialize-bridge/index',['exports', './autocomplete/autocomplete', './badge/badge', './box/box', './breadcrumbs/breadcrumbs', './breadcrumbs/instructionFilter', './button/button', './card/card', './carousel/carousel-item', './carousel/carousel', './char-counter/char-counter', './checkbox/checkbox', './chip/chip', './chip/chips', './collapsible/collapsible', './collection/collection-header', './collection/collection-item', './collection/collection', './collection/md-collection-selector', './colors/colorValueConverters', './colors/md-colors', './common/attributeManager', './common/attributes', './common/constants', './common/events', './datepicker/datepicker.default-parser', './datepicker/datepicker', './dropdown/dropdown-element', './dropdown/dropdown', './dropdown/dropdown-fix', './fab/fab', './file/file', './footer/footer', './input/input-prefix', './input/input-update-service', './input/input', './modal/modal-trigger', './navbar/navbar', './pagination/pagination', './parallax/parallax', './progress/progress', './pushpin/pushpin', './radio/radio', './range/range', './scrollfire/scrollfire-patch', './scrollfire/scrollfire-target', './scrollfire/scrollfire', './scrollspy/scrollspy', './select/select', './sidenav/sidenav-collapse', './sidenav/sidenav', './slider/slider', './switch/switch', './tabs/tabs', './toast/toastService', './tooltip/tooltip', './transitions/fadein-image', './transitions/staggered-list', './validation/validationRenderer', './waves/waves', './config-builder', './common/polyfills'], function (exports, _autocomplete, _badge, _box, _breadcrumbs, _instructionFilter, _button, _card, _carouselItem, _carousel, _charCounter, _checkbox, _chip, _chips, _collapsible, _collectionHeader, _collectionItem, _collection, _mdCollectionSelector, _colorValueConverters, _mdColors, _attributeManager, _attributes, _constants, _events, _datepicker, _datepicker2, _dropdownElement, _dropdown, _dropdownFix, _fab, _file, _footer, _inputPrefix, _inputUpdateService, _input, _modalTrigger, _navbar, _pagination, _parallax, _progress, _pushpin, _radio, _range, _scrollfirePatch, _scrollfireTarget, _scrollfire, _scrollspy, _select, _sidenavCollapse, _sidenav, _slider, _switch, _tabs, _toastService, _tooltip, _fadeinImage, _staggeredList, _validationRenderer, _waves, _configBuilder, _polyfills) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  Object.keys(_autocomplete).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _autocomplete[key];
      }
    });
  });
  Object.keys(_badge).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _badge[key];
      }
    });
  });
  Object.keys(_box).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _box[key];
      }
    });
  });
  Object.keys(_breadcrumbs).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _breadcrumbs[key];
      }
    });
  });
  Object.keys(_instructionFilter).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _instructionFilter[key];
      }
    });
  });
  Object.keys(_button).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _button[key];
      }
    });
  });
  Object.keys(_card).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _card[key];
      }
    });
  });
  Object.keys(_carouselItem).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _carouselItem[key];
      }
    });
  });
  Object.keys(_carousel).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _carousel[key];
      }
    });
  });
  Object.keys(_charCounter).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _charCounter[key];
      }
    });
  });
  Object.keys(_checkbox).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _checkbox[key];
      }
    });
  });
  Object.keys(_chip).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _chip[key];
      }
    });
  });
  Object.keys(_chips).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _chips[key];
      }
    });
  });
  Object.keys(_collapsible).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _collapsible[key];
      }
    });
  });
  Object.keys(_collectionHeader).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _collectionHeader[key];
      }
    });
  });
  Object.keys(_collectionItem).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _collectionItem[key];
      }
    });
  });
  Object.keys(_collection).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _collection[key];
      }
    });
  });
  Object.keys(_mdCollectionSelector).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _mdCollectionSelector[key];
      }
    });
  });
  Object.keys(_colorValueConverters).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _colorValueConverters[key];
      }
    });
  });
  Object.keys(_mdColors).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _mdColors[key];
      }
    });
  });
  Object.keys(_attributeManager).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _attributeManager[key];
      }
    });
  });
  Object.keys(_attributes).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _attributes[key];
      }
    });
  });
  Object.keys(_constants).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _constants[key];
      }
    });
  });
  Object.keys(_events).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _events[key];
      }
    });
  });
  Object.keys(_datepicker).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _datepicker[key];
      }
    });
  });
  Object.keys(_datepicker2).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _datepicker2[key];
      }
    });
  });
  Object.keys(_dropdownElement).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _dropdownElement[key];
      }
    });
  });
  Object.keys(_dropdown).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _dropdown[key];
      }
    });
  });
  Object.keys(_dropdownFix).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _dropdownFix[key];
      }
    });
  });
  Object.keys(_fab).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _fab[key];
      }
    });
  });
  Object.keys(_file).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _file[key];
      }
    });
  });
  Object.keys(_footer).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _footer[key];
      }
    });
  });
  Object.keys(_inputPrefix).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _inputPrefix[key];
      }
    });
  });
  Object.keys(_inputUpdateService).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _inputUpdateService[key];
      }
    });
  });
  Object.keys(_input).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _input[key];
      }
    });
  });
  Object.keys(_modalTrigger).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _modalTrigger[key];
      }
    });
  });
  Object.keys(_navbar).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _navbar[key];
      }
    });
  });
  Object.keys(_pagination).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _pagination[key];
      }
    });
  });
  Object.keys(_parallax).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _parallax[key];
      }
    });
  });
  Object.keys(_progress).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _progress[key];
      }
    });
  });
  Object.keys(_pushpin).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _pushpin[key];
      }
    });
  });
  Object.keys(_radio).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _radio[key];
      }
    });
  });
  Object.keys(_range).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _range[key];
      }
    });
  });
  Object.keys(_scrollfirePatch).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _scrollfirePatch[key];
      }
    });
  });
  Object.keys(_scrollfireTarget).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _scrollfireTarget[key];
      }
    });
  });
  Object.keys(_scrollfire).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _scrollfire[key];
      }
    });
  });
  Object.keys(_scrollspy).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _scrollspy[key];
      }
    });
  });
  Object.keys(_select).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _select[key];
      }
    });
  });
  Object.keys(_sidenavCollapse).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _sidenavCollapse[key];
      }
    });
  });
  Object.keys(_sidenav).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _sidenav[key];
      }
    });
  });
  Object.keys(_slider).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _slider[key];
      }
    });
  });
  Object.keys(_switch).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _switch[key];
      }
    });
  });
  Object.keys(_tabs).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _tabs[key];
      }
    });
  });
  Object.keys(_toastService).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _toastService[key];
      }
    });
  });
  Object.keys(_tooltip).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _tooltip[key];
      }
    });
  });
  Object.keys(_fadeinImage).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _fadeinImage[key];
      }
    });
  });
  Object.keys(_staggeredList).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _staggeredList[key];
      }
    });
  });
  Object.keys(_validationRenderer).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _validationRenderer[key];
      }
    });
  });
  Object.keys(_waves).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _waves[key];
      }
    });
  });


  function applyPolyfills() {
    (0, _polyfills.polyfillElementClosest)();
  }

  function configure(aurelia, configCallback) {
    applyPolyfills();
    var builder = new _configBuilder.ConfigBuilder();

    if (configCallback !== undefined && typeof configCallback === 'function') {
      configCallback(builder);
    }

    if (builder.useGlobalResources) {
      aurelia.globalResources(builder.globalResources);
    }
    if (builder.useScrollfirePatch) {
      new _scrollfirePatch.ScrollfirePatch().patch();
    }
  }
});;define('aurelia-materialize-bridge', ['aurelia-materialize-bridge/index'], function (main) { return main; });

define('aurelia-materialize-bridge/index',['exports', './autocomplete/autocomplete', './badge/badge', './box/box', './breadcrumbs/breadcrumbs', './breadcrumbs/instructionFilter', './button/button', './card/card', './carousel/carousel-item', './carousel/carousel', './char-counter/char-counter', './checkbox/checkbox', './chip/chip', './chip/chips', './collapsible/collapsible', './collection/collection-header', './collection/collection-item', './collection/collection', './collection/md-collection-selector', './colors/colorValueConverters', './colors/md-colors', './common/attributeManager', './common/attributes', './common/constants', './common/events', './datepicker/datepicker.default-parser', './datepicker/datepicker', './dropdown/dropdown-element', './dropdown/dropdown', './dropdown/dropdown-fix', './fab/fab', './file/file', './footer/footer', './input/input-prefix', './input/input-update-service', './input/input', './modal/modal-trigger', './navbar/navbar', './pagination/pagination', './parallax/parallax', './progress/progress', './pushpin/pushpin', './radio/radio', './range/range', './scrollfire/scrollfire-patch', './scrollfire/scrollfire-target', './scrollfire/scrollfire', './scrollspy/scrollspy', './select/select', './sidenav/sidenav-collapse', './sidenav/sidenav', './slider/slider', './switch/switch', './tabs/tabs', './toast/toastService', './tooltip/tooltip', './transitions/fadein-image', './transitions/staggered-list', './validation/validationRenderer', './waves/waves', './config-builder', './common/polyfills'], function (exports, _autocomplete, _badge, _box, _breadcrumbs, _instructionFilter, _button, _card, _carouselItem, _carousel, _charCounter, _checkbox, _chip, _chips, _collapsible, _collectionHeader, _collectionItem, _collection, _mdCollectionSelector, _colorValueConverters, _mdColors, _attributeManager, _attributes, _constants, _events, _datepicker, _datepicker2, _dropdownElement, _dropdown, _dropdownFix, _fab, _file, _footer, _inputPrefix, _inputUpdateService, _input, _modalTrigger, _navbar, _pagination, _parallax, _progress, _pushpin, _radio, _range, _scrollfirePatch, _scrollfireTarget, _scrollfire, _scrollspy, _select, _sidenavCollapse, _sidenav, _slider, _switch, _tabs, _toastService, _tooltip, _fadeinImage, _staggeredList, _validationRenderer, _waves, _configBuilder, _polyfills) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  Object.keys(_autocomplete).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _autocomplete[key];
      }
    });
  });
  Object.keys(_badge).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _badge[key];
      }
    });
  });
  Object.keys(_box).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _box[key];
      }
    });
  });
  Object.keys(_breadcrumbs).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _breadcrumbs[key];
      }
    });
  });
  Object.keys(_instructionFilter).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _instructionFilter[key];
      }
    });
  });
  Object.keys(_button).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _button[key];
      }
    });
  });
  Object.keys(_card).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _card[key];
      }
    });
  });
  Object.keys(_carouselItem).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _carouselItem[key];
      }
    });
  });
  Object.keys(_carousel).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _carousel[key];
      }
    });
  });
  Object.keys(_charCounter).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _charCounter[key];
      }
    });
  });
  Object.keys(_checkbox).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _checkbox[key];
      }
    });
  });
  Object.keys(_chip).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _chip[key];
      }
    });
  });
  Object.keys(_chips).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _chips[key];
      }
    });
  });
  Object.keys(_collapsible).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _collapsible[key];
      }
    });
  });
  Object.keys(_collectionHeader).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _collectionHeader[key];
      }
    });
  });
  Object.keys(_collectionItem).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _collectionItem[key];
      }
    });
  });
  Object.keys(_collection).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _collection[key];
      }
    });
  });
  Object.keys(_mdCollectionSelector).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _mdCollectionSelector[key];
      }
    });
  });
  Object.keys(_colorValueConverters).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _colorValueConverters[key];
      }
    });
  });
  Object.keys(_mdColors).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _mdColors[key];
      }
    });
  });
  Object.keys(_attributeManager).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _attributeManager[key];
      }
    });
  });
  Object.keys(_attributes).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _attributes[key];
      }
    });
  });
  Object.keys(_constants).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _constants[key];
      }
    });
  });
  Object.keys(_events).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _events[key];
      }
    });
  });
  Object.keys(_datepicker).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _datepicker[key];
      }
    });
  });
  Object.keys(_datepicker2).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _datepicker2[key];
      }
    });
  });
  Object.keys(_dropdownElement).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _dropdownElement[key];
      }
    });
  });
  Object.keys(_dropdown).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _dropdown[key];
      }
    });
  });
  Object.keys(_dropdownFix).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _dropdownFix[key];
      }
    });
  });
  Object.keys(_fab).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _fab[key];
      }
    });
  });
  Object.keys(_file).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _file[key];
      }
    });
  });
  Object.keys(_footer).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _footer[key];
      }
    });
  });
  Object.keys(_inputPrefix).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _inputPrefix[key];
      }
    });
  });
  Object.keys(_inputUpdateService).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _inputUpdateService[key];
      }
    });
  });
  Object.keys(_input).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _input[key];
      }
    });
  });
  Object.keys(_modalTrigger).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _modalTrigger[key];
      }
    });
  });
  Object.keys(_navbar).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _navbar[key];
      }
    });
  });
  Object.keys(_pagination).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _pagination[key];
      }
    });
  });
  Object.keys(_parallax).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _parallax[key];
      }
    });
  });
  Object.keys(_progress).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _progress[key];
      }
    });
  });
  Object.keys(_pushpin).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _pushpin[key];
      }
    });
  });
  Object.keys(_radio).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _radio[key];
      }
    });
  });
  Object.keys(_range).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _range[key];
      }
    });
  });
  Object.keys(_scrollfirePatch).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _scrollfirePatch[key];
      }
    });
  });
  Object.keys(_scrollfireTarget).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _scrollfireTarget[key];
      }
    });
  });
  Object.keys(_scrollfire).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _scrollfire[key];
      }
    });
  });
  Object.keys(_scrollspy).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _scrollspy[key];
      }
    });
  });
  Object.keys(_select).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _select[key];
      }
    });
  });
  Object.keys(_sidenavCollapse).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _sidenavCollapse[key];
      }
    });
  });
  Object.keys(_sidenav).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _sidenav[key];
      }
    });
  });
  Object.keys(_slider).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _slider[key];
      }
    });
  });
  Object.keys(_switch).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _switch[key];
      }
    });
  });
  Object.keys(_tabs).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _tabs[key];
      }
    });
  });
  Object.keys(_toastService).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _toastService[key];
      }
    });
  });
  Object.keys(_tooltip).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _tooltip[key];
      }
    });
  });
  Object.keys(_fadeinImage).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _fadeinImage[key];
      }
    });
  });
  Object.keys(_staggeredList).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _staggeredList[key];
      }
    });
  });
  Object.keys(_validationRenderer).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _validationRenderer[key];
      }
    });
  });
  Object.keys(_waves).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _waves[key];
      }
    });
  });


  function applyPolyfills() {
    (0, _polyfills.polyfillElementClosest)();
  }

  function configure(aurelia, configCallback) {
    applyPolyfills();
    var builder = new _configBuilder.ConfigBuilder();

    if (configCallback !== undefined && typeof configCallback === 'function') {
      configCallback(builder);
    }

    if (builder.useGlobalResources) {
      aurelia.globalResources(builder.globalResources);
    }
    if (builder.useScrollfirePatch) {
      new _scrollfirePatch.ScrollfirePatch().patch();
    }
  }
});;define('aurelia-materialize-bridge', ['aurelia-materialize-bridge/index'], function (main) { return main; });

define('text!aurelia-materialize-bridge/click-counter.html', ['module'], function(module) { module.exports = "<template>\n  <h2>Click counter</h2>\n\n  <button md-waves class=\"btn\" click.delegate=\"increment()\">Button</button>\n\n  <h2>Button was clicked ${count} times</h2>\n</template>\n"; });
define('text!aurelia-materialize-bridge/breadcrumbs/breadcrumbs.css', ['module'], function(module) { module.exports = "md-breadcrumbs a {\n  cursor: pointer;\n}\n"; });
define('text!aurelia-materialize-bridge/breadcrumbs/breadcrumbs.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./breadcrumbs.css\"></require>\n  <require from=\"./instructionFilter\"></require>\n  <nav class=\"primary\">\n    <div class=\"nav-wrapper\">\n      <div class=\"col s12\">\n        <template repeat.for=\"instruction of router.currentInstruction.getAllInstructions() | instructionFilter\">\n          <a click.delegate=\"navigate(instruction)\" class=\"breadcrumb\">\n            ${instruction.config.title}\n          </a>\n        </template>\n      </div>\n    </div>\n  </nav>\n</template>\n"; });
define('text!aurelia-materialize-bridge/card/card.css', ['module'], function(module) { module.exports = "md-card {\n  display: block;\n}\n"; });
define('text!aurelia-materialize-bridge/card/card.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./card.css\"></require>\n  <div class=\"card ${ mdHorizontal ? 'horizontal' : '' } ${ mdSize || '' }\">\n    <div if.bind=\"mdImage !== null\" md-waves=\"color: light; block: true;\" class=\"card-image\">\n      <img class=\"${ mdReveal === true ? 'activator' : '' }\" src.bind=\"mdImage\" />\n      <span if.bind=\"mdReveal === false\" class=\"card-title\">${mdTitle}</span>\n    </div>\n\n    <!-- <div class=\"${ mdHorizontal ? 'card-stacked' : ''}\">\n\n    </div> -->\n    <div class=\"card-content\">\n      <span if.bind=\"mdReveal === true\" class=\"card-title activator\">\n        ${mdTitle}\n        <i class=\"material-icons right\">more_vert</i>\n      </span>\n      <span if.bind=\"mdImage === null\" class=\"card-title\">${mdTitle}</span>\n      <slot></slot>\n    </div>\n\n    <div show.bind=\"mdReveal\" class=\"${ mdReveal ? 'card-reveal' : '' }\">\n      <span class=\"card-title ${ mdReveal ? 'activator' : '' }\">\n        ${mdTitle}\n        <i class=\"material-icons right\">close</i>\n      </span>\n      <slot name=\"reveal-text\"></slot>\n    </div>\n  </div>\n</template>\n"; });
define('text!aurelia-materialize-bridge/carousel/carousel.css', ['module'], function(module) { module.exports = "md-carousel {\r\n  display: block;\r\n}\r\n"; });
define('text!aurelia-materialize-bridge/carousel/carousel-item.html', ['module'], function(module) { module.exports = "<template class=\"carousel-item\">\n  <a if.bind=\"mdHref\" href.bind=\"mdHref\">\n    <img if.bind=\"mdImage\" src.bind=\"mdImage\" />\n  </a>\n  <img if.bind=\"!mdHref\" src.bind=\"mdImage\" />\n  <slot></slot>\n</template>\n"; });
define('text!aurelia-materialize-bridge/carousel/carousel.html', ['module'], function(module) { module.exports = "<template class=\"carousel\">\n  <require from=\"./carousel.css\"></require>\n  <slot></slot>\n</template>\n"; });
define('text!aurelia-materialize-bridge/checkbox/checkbox.html', ['module'], function(module) { module.exports = "<template>\n  <input type=\"checkbox\" id=\"${controlId}\" ref=\"checkbox\" blur.trigger=\"blur()\" />\n  <label for=\"${controlId}\">\n    <slot></slot>\n  </label>\n</template>\n"; });
define('text!aurelia-materialize-bridge/chip/chip.css', ['module'], function(module) { module.exports = "md-chip i.material-icons {\n  float: right;\n  line-height: 32px;\n  font-size: 16px;\n}\n"; });
define('text!aurelia-materialize-bridge/chip/chip.html', ['module'], function(module) { module.exports = "<template class=\"chip\">\n  <require from=\"./chip.css\"></require>\n  <slot></slot>\n  <i show.bind=\"mdClose\" class=\"material-icons\">close</i>\n</template>\n"; });
define('text!aurelia-materialize-bridge/collection/collection-header.css', ['module'], function(module) { module.exports = "md-collection-header {\n  display: block;\n}\n"; });
define('text!aurelia-materialize-bridge/collection/collection-item.css', ['module'], function(module) { module.exports = "md-collection-item {\n  display: block;\n}\n\nmd-collection-item.collection-item:not(.active):hover {\n  background-color: #ddd;\n}\n"; });
define('text!aurelia-materialize-bridge/collection/md-collection-selector.css', ['module'], function(module) { module.exports = "md-collection-selector .md-collection-selector__hover {\n  display: inline-block;\n}\nmd-collection-selector:hover .md-collection-selector__hover, md-collection-item.selected md-collection-selector .md-collection-selector__hover {\n  display: none !important;\n}\nmd-collection-selector .md-collection-selector__checkbox div {\n  margin-left: 5px;\n  display: inline-block;\n  position: absolute;\n  left: 20px;\n  top: 20px;\n  margin-right: 11px;\n  height: 42px;\n  width: 42px;\n  line-height: 42px;\n  text-align: center;\n}\nmd-collection-selector .md-collection-selector__checkbox .md-collection-selector__hover ~ div {\n  display: none;\n}\n\nmd-collection-selector:hover .md-collection-selector__checkbox .md-collection-selector__hover ~ div, md-collection-item.selected md-collection-selector .md-collection-selector__checkbox .md-collection-selector__hover ~ div {\n  display: inline-block;\n}\n\nmd-collection-item.selected {\n  background-color: #eee;\n}\n\nmd-collection-selector md-checkbox {\n  display: inline-block;\n}\nmd-collection-selector md-collection md-checkbox .md-checkbox.is-upgraded {\n  padding-left: 16px;\n}\n"; });
define('text!aurelia-materialize-bridge/collection/collection-header.html', ['module'], function(module) { module.exports = "<template class=\"collection-header\">\n  <require from=\"./collection-header.css\"></require>\n  <slot></slot>\n</template>\n"; });
define('text!aurelia-materialize-bridge/collection/collection-item.html', ['module'], function(module) { module.exports = "<template class=\"collection-item\">\n  <require from=\"./collection-item.css\"></require>\n  <slot></slot>\n  <!-- <content select=\".secondary-content\"></content> -->\n</template>\n"; });
define('text!aurelia-materialize-bridge/collection/collection.html', ['module'], function(module) { module.exports = "<template>\n  <div class=\"collection\" ref=\"anchor\">\n    <!-- <content select=\"md-collection-header\"></content>\n    <content select=\"md-collection-item\"></content> -->\n    <slot></slot>\n  </div>\n</template>\n"; });
define('text!aurelia-materialize-bridge/collection/md-collection-selector.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./md-collection-selector.css\"></require>\n  <div class=\"md-collection-selector__checkbox\">\n    <!-- <content select=\".md-collection-selector__hover\"></content> -->\n    <slot></slot>\n    <div>\n      <md-checkbox md-checked.two-way=\"isSelected\" md-disabled.bind=\"mdDisabled\"></mdl-checkbox>\n    </div>\n</template>\n"; });
define('text!aurelia-materialize-bridge/colors/md-colors.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./colorValueConverters\"></require>\n\n  <!--\n    According to Material color spec (https://www.google.com/design/spec/style/color.html#color-ui-color-application)\n    and using Materialize terminology (darken/lighten instead of hue numbers)\n    the used palettes here consist of:\n    Primary - lighten-1 (400), lighten-2 (300), lighten-3 (200)\n    Accent  - lighten-1 (400), lighten-3 (200)\n\n    These should optionally be defined by the user. At the moment, they are\n    calculated and even not exact (but close).\n\n    Focused elements are an exception, these use \"lighten-0.5\" which is\n    not specified anywhere.\n  -->\n\n  <style>\n  .primary {\n    background-color: ${mdPrimaryColor};\n    color: white;\n  }\n\n  .primary-text {\n    /*background-color: white;*/\n    color: ${mdPrimaryColor};\n  }\n\n  .waves-effect.waves-primary .waves-ripple {\n    background-color: ${mdPrimaryColor};\n  }\n\n  .waves-effect.waves-accent .waves-ripple {\n    background-color: ${mdAccentColor};\n  }\n\n  .accent {\n    background-color: ${mdAccentColor};\n    color: white;\n  }\n\n  .accent-text {\n    /*background-color: white;*/\n    color: ${mdAccentColor};\n  }\n\n  .error {\n    background-color: ${mdErrorColor};\n  }\n\n  .error-text {\n    color: ${mdErrorColor}\n  }\n\n  .success {\n    background-color: ${mdAccentColor};\n    color: white;\n  }\n\n  .success-text {\n    color: ${mdAccentColor};\n  }\n\n  /* buttons */\n  .btn.primary, .btn-flat.primary, .btn-large.primary {\n    transition: .2s ease-out;\n  }\n  .btn.primary:hover, .btn-flat.primary:hover, .btn-large.primary:hover {\n    background-color: ${mdPrimaryColor | lighten:1};\n    transition: .2s ease-out;\n  }\n  .btn.primary:focus, .btn-flat.primary:focus, .btn-large.primary:focus {\n    background-color: ${mdPrimaryColor | lighten:0.5};\n    transition: .2s ease-out;\n  }\n  .btn-flat:not(.disabled):hover {\n    /*background-color: ${mdAccentColor | lighten:3};*/\n    background-color: rgba(50, 50, 50, .15);\n    box-shadow: 0 5px 11px 0 rgba(0, 0, 0, 0.18), 0 4px 15px 0 rgba(0, 0, 0, 0.15);\n    border: none;\n    box-shadow: none;\n    transition: .2s ease-out;\n  }\n  .btn-flat:focus {\n    /*background-color: ${mdAccentColor | lighten:2};*/\n    background-color: transparent;\n    border: none;\n    box-shadow: none;\n    transition: .2s ease-out;\n  }\n\n  .btn.accent, .btn-flat.accent, .btn-large.accent {\n    transition: .2s ease-out;\n  }\n  .btn.accent:hover, .btn-flat.accent:hover, .btn-large.accent:hover, .btn-floating:hover {\n    background-color: ${mdAccentColor | lighten:1};\n    transition: .2s ease-out;\n  }\n  .btn.accent:focus, .btn-flat.accent:focus, .btn-large.accent:focus, .btn-floating:focus {\n    background-color: ${mdAccentColor | lighten:0.5};\n    transition: .2s ease-out;\n  }\n\n  /* checkbox */\n  [type=\"checkbox\"]:checked + label:before {\n    border-right-color: ${mdAccentColor};\n    border-bottom-color: ${mdAccentColor};\n  }\n\n  [type=\"checkbox\"].filled-in:checked + label:after {\n    border-color: ${mdAccentColor};\n    background-color: ${mdAccentColor};\n  }\n\n  [type=\"checkbox\"]:indeterminate + label:before {\n    border-right-color: ${mdAccentColor};\n  }\n\n  /* collection */\n  md-collection .collection md-collection-item.collection-item.active {\n    background-color: ${mdAccentColor};\n    color: white;\n  }\n\n  md-collection .collection md-collection-item.collection-item .secondary-content {\n    color: ${mdAccentColor};\n  }\n\n  md-collection .collection md-collection-item.collection-item.avatar i.circle.primary {\n    background-color: ${mdPrimaryColor};\n  }\n  md-collection .collection md-collection-item.collection-item.avatar i.circle.accent {\n    background-color: ${mdAccentColor};\n  }\n  md-collection .collection md-collection-item.collection-item.avatar i.circle.error {\n    background-color: ${mdErrorColor};\n  }\n  md-collection .collection md-collection-item.collection-item.avatar i.circle.success {\n    background-color: ${mdAccentColor};\n  }\n  md-collection .collection md-collection-item.collection-item.avatar i.circle.primary-text {\n    color: ${mdPrimaryColor};\n    background-color: transparent;\n  }\n  md-collection .collection md-collection-item.collection-item.avatar i.circle.accent-text {\n    color: ${mdAccentColor};\n    background-color: transparent;\n  }\n  md-collection .collection md-collection-item.collection-item.avatar i.circle.error-text {\n    color: ${mdErrorColor};\n    background-color: transparent;\n  }\n  md-collection .collection md-collection-item.collection-item.avatar i.circle.success-text {\n    color: ${mdAccentColor};\n    background-color: transparent;\n  }   \n\n\n  /* datepicker */\n  .picker__date-display {\n    background-color: ${mdAccentColor};\n  }\n  .picker__weekday-display {\n    background-color: ${mdAccentColor | darken:1};\n  }\n  .picker__day--selected, .picker__day--selected:hover, .picker--focused .picker__day--selected {\n    background-color: ${mdAccentColor};\n  }\n  .picker__day.picker__day--today {\n    color: ${mdAccentColor}\n  }\n  .picker__footer button:not(.picker__clear) {\n    color: ${mdAccentColor}\n  }\n  .picker__footer button:focus {\n    background-color: ${mdAccentColor | lighten:2};\n  }\n\n  /* text input */\n  md-input .input-field label {\n    left: 0;\n  }\n  md-input .input-field input[type=text]:focus {\n    border-bottom: 1px solid ${mdAccentColor};\n    box-shadow: 0 1px 0 0 ${mdAccentColor};\n  }\n  md-input .input-field input[type=text]:focus + label {\n    color: ${mdAccentColor};\n  }\n  md-input .input-field input[type=email]:focus {\n    border-bottom: 1px solid ${mdAccentColor};\n    box-shadow: 0 1px 0 0 ${mdAccentColor};\n  }\n  md-input .input-field input[type=email]:focus + label {\n    color: ${mdAccentColor};\n  }\n  md-input .input-field input[type=password]:focus {\n    border-bottom: 1px solid ${mdAccentColor};\n    box-shadow: 0 1px 0 0 ${mdAccentColor};\n  }\n  md-input .input-field input[type=password]:focus + label {\n    color: ${mdAccentColor};\n  }\n  md-input .input-field .prefix.active {\n    color: ${mdAccentColor};\n  }\n  md-input textarea.materialize-textarea:focus:not([readonly]) {\n    border-bottom: 1px solid ${mdAccentColor};\n    box-shadow: 0 1px 0 0 ${mdAccentColor};\n  }\n  md-input textarea.materialize-textarea:focus:not([readonly]) + label {\n    color: ${mdAccentColor}\n  }\n\n  md-input input:not([type]).invalid + label:after,\n  md-input input:not([type]):focus.invalid + label:after,\n  md-input input[type=text].invalid + label:after,\n  md-input input[type=text]:focus.invalid + label:after,\n  md-input input[type=password].invalid + label:after,\n  md-input input[type=password]:focus.invalid + label:after,\n  md-input input[type=email].invalid + label:after,\n  md-input input[type=email]:focus.invalid + label:after,\n  md-input input[type=url].invalid + label:after,\n  md-input input[type=url]:focus.invalid + label:after,\n  md-input input[type=time].invalid + label:after,\n  md-input input[type=time]:focus.invalid + label:after,\n  md-input input[type=date].invalid + label:after,\n  md-input input[type=date]:focus.invalid + label:after,\n  md-input input[type=datetime].invalid + label:after,\n  md-input input[type=datetime]:focus.invalid + label:after,\n  md-input input[type=datetime-local].invalid + label:after,\n  md-input input[type=datetime-local]:focus.invalid + label:after,\n  md-input input[type=tel].invalid + label:after,\n  md-input input[type=tel]:focus.invalid + label:after,\n  md-input input[type=number].invalid + label:after,\n  md-input input[type=number]:focus.invalid + label:after,\n  md-input input[type=search].invalid + label:after,\n  md-input input[type=search]:focus.invalid + label:after,\n  md-input textarea.materialize-textarea.invalid + label:after,\n  md-input textarea.materialize-textarea:focus.invalid + label:after\n  {\n    color: ${mdErrorColor}\n  }\n\n  /* text input aurelia-validation messages */\n  .md-input-validation {\n    left: 0;\n    /*color: #f44336;*/\n    color: ${mdErrorColor};\n    font-size: 0.8rem;\n    transition: opacity .2s ease-out;\n    margin-top: -4px;\n    margin-bottom: 0;\n  }\n  @media only screen and (min-width: 0) {\n    .md-input-validation-first {\n      margin-top: -14px;\n      margin-bottom: -2px;\n    }\n  }\n  @media only screen and (min-width: 992px) {\n    .md-input-validation-first {\n      margin-top: -18px;\n      padding-bottom: 3px;\n    }\n  }\n  @media only screen and (min-width: 1200px) {\n    .md-input-validation-first {\n      margin-top: -19px;\n    }\n  }\n\n  /* pagination */\n  md-pagination .pagination li.active {\n    background-color: ${mdPrimaryColor}\n  }\n\n  /* progress */\n  md-progress .progress {\n    background-color: ${mdAccentColor | lighten:2};\n  }\n\n  md-progress .progress .determinate, md-progress .progress .indeterminate {\n    background-color: ${mdAccentColor};\n  }\n\n  /* radio input */\n  md-radio input[type=\"radio\"]:checked + label:after {\n    border: 2px solid ${mdAccentColor};\n    background-color: ${mdAccentColor};\n  }\n  md-radio [type=\"radio\"].with-gap:checked + label:before {\n    border: 2px solid ${mdAccentColor};\n  }\n  md-radio [type=\"radio\"].with-gap:checked + label:after {\n    border: 2px solid ${mdAccentColor};\n    background-color: ${mdAccentColor};\n  }\n\n  /* range */\n  md-range .range-field input[type=\"range\"]::-webkit-slider-thumb {\n    background: ${mdAccentColor};\n  }\n  md-range .range-field input[type=\"range\"]::-moz-range-thumb {\n    background: ${mdAccentColor};\n  }\n  md-range .range-field input[type=\"range\"]::-ms-thumb {\n    background: ${mdAccentColor};\n  }\n  md-range input[type=\"range\"] + .thumb {\n    background-color: ${mdAccentColor} !important;\n  }\n\n  /* select */\n  .dropdown-content li > a, .dropdown-content li > span {\n    color: ${mdAccentColor};\n  }\n\n  /* side-nav */\n  .side-nav .collapsible-body li.active, .side-nav.fixed .collapsible-body li.active {\n    background-color: ${mdPrimaryColor};\n  }\n\n  /* slider */\n  .slider .indicators .indicator-item.active {\n    background-color: ${mdAccentColor};\n  }\n\n  /* switch */\n  md-switch.switch label input[type=checkbox]:checked + .lever {\n    background-color: ${mdAccentColor | lighten:1};\n  }\n  md-switch.switch label input[type=checkbox]:checked + .lever:after {\n    background-color: ${mdAccentColor};\n  }\n\n  /* tabs */\n\n  .tab.primary-text a {\n    color: ${mdPrimaryColor};\n  }\n  .tab.primary-text a:hover {\n    color: ${mdPrimaryColor | lighten:2};\n  }\n  .tabs .indicator {\n    background-color: ${mdPrimaryColor | lighten:2};\n  }\n\n  /* well */\n  md-well li.active {\n    border-right: 2px solid ${mdPrimaryColor};\n    background-color: ${mdPrimaryColor | lighten:3};\n  }\n\n  /* footer */\n  footer.page-footer {\n    background-color: ${mdPrimaryColor};\n  }\n\n  /* md-select label */\n  .select-wrapper input {\n    // make input fit in div\n    display: inline-block !important;\n    // fix validation border thickness\n    border-bottom: 1px solid #4CAF50;\n  }\n\n  .select-wrapper input.invalid {\n    border-bottom: 1px solid ${mdErrorColor};\n  }\n\n  .select-wrapper + label {\n    color: ${mdAccentColor};\n    width: 100%;\n  }\n  /* position validation label */\n  .select-wrapper + label:after {\n    display: block;\n    content: \"\";\n    position: absolute;\n    top: 60px;\n    opacity: 0;\n    transition: .2s opacity ease-out, .2s color ease-out;\n    transform: translateY(0) !important;\n  }\n  /* set validation text */\n  .select-wrapper.invalid + label:after {\n    content: attr(data-error);\n    color: ${mdErrorColor};\n    opacity: 1;\n  }\n\n  </style>\n</template>\n"; });
define('text!aurelia-materialize-bridge/dropdown/dropdown-element.html', ['module'], function(module) { module.exports = "<template md-button class=\"dropdown-button\" data-activates=\"${ controlId }\">\n  ${mdTitle}\n  <div id=\"${ controlId }\" class='dropdown-content'>\n    <slot></slot>\n  </div>\n</template>\n"; });
define('text!aurelia-materialize-bridge/fab/fab.html', ['module'], function(module) { module.exports = "<template>\n  <a if.bind=\"mdFixed === false\" md-button=\"large.bind: mdLarge;\" md-waves=\"color: light;\" class=\"btn-floating\">\n    <slot></slot>\n  </a>\n\n  <div if.bind=\"mdFixed === true\" class=\"fixed-action-btn\" style=\"bottom: 45px; right: 24px;\">\n    <a md-button=\"large: true;\" md-waves=\"color: light;\" class=\"btn-floating\">\n      <slot></slot>\n    </a>\n  </div>\n</template>\n"; });
define('text!aurelia-materialize-bridge/file/file.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"file-field input-field\">\n        <div class=\"btn accent\">\n            <span>${mdCaption}</span>\n            <input type=\"file\" multiple.bind=\"mdMultiple\" files.bind=\"files\" />\n        </div>\n        <div class=\"file-path-wrapper\">\n            <input class=\"file-path validate\" type=\"text\" value.bind=\"mdLabelValue\" ref=\"filePath\" />\n        </div>\n    </div>\n</template>\n"; });
define('text!aurelia-materialize-bridge/input/input.css', ['module'], function(module) { module.exports = "/*md-input .input-field label {\n  transform: translateX(-11px);\n}\nmd-input .input-field label.active {\n  transform: translateX(-11px) translateY(-140%);\n}*/\n\nmd-input .input-field label.active {\n  width: 100%;\n}\n"; });
define('text!aurelia-materialize-bridge/input/input.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./input.css\"></require>\n  <div class=\"input-field\">\n    <!-- <content select=\"[md-prefix]\"></content> -->\n    <slot></slot>\n    <input if.bind=\"mdTextArea === false\" id=\"${controlId}\" type.bind=\"mdType\" step.bind=\"mdStep\" ref=\"input\" value.bind=\"mdValue\" disabled.bind=\"mdDisabled\" blur.trigger=\"blur()\" />\n    <textarea if.bind=\"mdTextArea === true\" id=\"${controlId}\" ref=\"input\" value.bind=\"mdValue\" class=\"materialize-textarea\" disabled.bind=\"mdDisabled\" blur.trigger=\"blur()\"></textarea>\n    <label for=\"${controlId}\" ref=\"label\">${mdLabel}</label>\n  </div>\n</template>\n"; });
define('text!aurelia-materialize-bridge/navbar/navbar.css', ['module'], function(module) { module.exports = "md-navbar .primary {\n  transition: all .3s ease-out;\n}\n"; });
define('text!aurelia-materialize-bridge/navbar/navbar.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./navbar.css\"></require>\n  <div ref=\"fixedAnchor\">\n    <nav class=\"primary\">\n      <div class=\"nav-wrapper\">\n        <slot></slot>\n      </div>\n    </nav>\n  </div>\n</template>\n"; });
define('text!aurelia-materialize-bridge/pagination/pagination.html', ['module'], function(module) { module.exports = "<template>\n  <ul class=\"pagination\">\n    <template if.bind=\"mdShowFirstLast\">\n      <li md-waves click.delegate=\"setFirstPage()\" class=\"${ mdActivePage === 1 ? 'disabled' : '' }\"><a><i class=\"material-icons\">first_page</i></a></li>\n    </template>\n    <template if.bind=\"mdShowPrevNext\">\n      <li md-waves click.delegate=\"setPreviousPage()\" class=\"${ mdActivePage === 1 ? 'disabled' : '' }\"><a><i class=\"material-icons\">chevron_left</i></a></li>\n    </template>\n    <template if.bind=\"mdShowPageLinks\">\n      <li md-waves click.delegate=\"setActivePage(p+1)\" repeat.for=\"p of mdPageLinks\" class=\"${ p+1 === mdActivePage ? 'active' : ''}\">\n        <span if.bind=\"$first && p > 0\">...</span>\n        <a>${p+1}</a>\n        <span if.bind=\"$last && p < pages - 1\">...</span>\n      </li>\n    </template>\n    <template if.bind=\"mdShowPrevNext\">\n      <li md-waves click.delegate=\"setNextPage()\" class=\"${ mdActivePage == pages ? 'disabled' : '' }\"><a><i class=\"material-icons\">chevron_right</i></a></li>\n    </template>\n    <template if.bind=\"mdShowFirstLast\">\n      <li md-waves click.delegate=\"setLastPage()\" class=\"${ mdActivePage == pages ? 'disabled' : '' }\"><a><i class=\"material-icons\">last_page</i></a></li>\n    </template>\n  </ul>\n</template>\n"; });
define('text!aurelia-materialize-bridge/progress/progress.html', ['module'], function(module) { module.exports = "<template>\n  <template if.bind=\"mdType === 'linear'\">\n    <div class=\"progress\">\n      <div class=\"${ mdValue === null ? 'indeterminate' : 'determinate' }\" css=\"width: ${ mdValue ? mdValue : 0 }%\"></div>\n  </div>\n  </template>\n  <template if.bind=\"mdType === 'circular' && mdColor !== 'flashing'\">\n    <div class=\"preloader-wrapper ${mdSize} active\" ref=\"wrapper\">\n      <div class=\"spinner-layer spinner-${mdColor}-only\">\n        <div class=\"circle-clipper left\">\n          <div class=\"circle\"></div>\n        </div><div class=\"gap-patch\">\n          <div class=\"circle\"></div>\n        </div><div class=\"circle-clipper right\">\n          <div class=\"circle\"></div>\n        </div>\n      </div>\n    </div>\n  </template>\n  <template if.bind=\"mdType === 'circular' && mdColor === 'flashing'\">\n    <div class=\"preloader-wrapper ${mdSize} active\" ref=\"wrapper\">\n      <div class=\"spinner-layer spinner-blue\">\n        <div class=\"circle-clipper left\">\n          <div class=\"circle\"></div>\n        </div><div class=\"gap-patch\">\n          <div class=\"circle\"></div>\n        </div><div class=\"circle-clipper right\">\n          <div class=\"circle\"></div>\n        </div>\n      </div>\n\n      <div class=\"spinner-layer spinner-red\">\n        <div class=\"circle-clipper left\">\n          <div class=\"circle\"></div>\n        </div><div class=\"gap-patch\">\n          <div class=\"circle\"></div>\n        </div><div class=\"circle-clipper right\">\n          <div class=\"circle\"></div>\n        </div>\n      </div>\n\n      <div class=\"spinner-layer spinner-yellow\">\n        <div class=\"circle-clipper left\">\n          <div class=\"circle\"></div>\n        </div><div class=\"gap-patch\">\n          <div class=\"circle\"></div>\n        </div><div class=\"circle-clipper right\">\n          <div class=\"circle\"></div>\n        </div>\n      </div>\n\n      <div class=\"spinner-layer spinner-green\">\n        <div class=\"circle-clipper left\">\n          <div class=\"circle\"></div>\n        </div><div class=\"gap-patch\">\n          <div class=\"circle\"></div>\n        </div><div class=\"circle-clipper right\">\n          <div class=\"circle\"></div>\n        </div>\n      </div>\n    </div>\n  </template>\n</template>\n"; });
define('text!aurelia-materialize-bridge/radio/radio.html', ['module'], function(module) { module.exports = "<template>\n  <input if.bind=\"!mdModel\" type=\"radio\" name=\"${mdName}\" value.bind=\"mdValue\" id=\"${controlId}\" checked.bind=\"mdChecked\" ref=\"radio\" />\n  <input if.bind=\"!!mdModel\" type=\"radio\" name=\"${mdName}\" model.bind=\"mdModel\" id=\"${controlId}\" checked.bind=\"mdChecked\" ref=\"radio\" />\n  <label for=\"${controlId}\">\n    <slot></slot>\n  </label>\n</template>\n"; });
define('text!aurelia-materialize-bridge/range/range.css', ['module'], function(module) { module.exports = "md-range input[type=\"range\"]::-ms-tooltip {\r\n  display: none;\r\n}\r\n"; });
define('text!aurelia-materialize-bridge/range/range.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./range.css\"></require>\n  <p class=\"range-field\">\n    <input type=\"range\" min.one-time=\"mdMin\" max.one-time=\"mdMax\" step.one-time=\"mdStep\" value.bind=\"mdValue\" ref=\"input\" />\n  </p>\n</template>\n"; });
define('text!aurelia-materialize-bridge/sidenav/sidenav.css', ['module'], function(module) { module.exports = "md-sidenav li[md-waves] {\n  display: block;\n}\nmd-sidenav li a:hover {\n  background-color: transparent;\n  display: inline-block;\n  width: 100%;\n}\n"; });
define('text!aurelia-materialize-bridge/sidenav/sidenav.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"./sidenav.css\"></require>\n  <div id=\"${ controlId }\" class=\"side-nav\" ref=\"sidenav\">\n    <slot></slot>\n  </div>\n</template>\n"; });
define('text!aurelia-materialize-bridge/slider/slider.css', ['module'], function(module) { module.exports = "md-slider {\n  display: block;\n}\n\nmd-slide {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: inherit;\n    overflow: hidden;\n}\n"; });
define('text!aurelia-materialize-bridge/switch/switch.css', ['module'], function(module) { module.exports = "md-switch {\n  display: block;\n}\n"; });
define('text!aurelia-materialize-bridge/switch/switch.html', ['module'], function(module) { module.exports = "<template class=\"switch\">\n  <require from=\"./switch.css\"></require>\n  <label>\n    ${mdLabelOff}\n    <input type=\"checkbox\" ref=\"checkbox\" blur.trigger=\"blur()\">\n    <span class=\"lever\"></span>\n    ${mdLabelOn}\n  </label>\n</template>\n"; });
define('text!aurelia-materialize-bridge/well/md-well.html', ['module'], function(module) { module.exports = "<template bindable=\"router\">\n<style>\n  md-well li[md-waves] {\n    display: block;\n  }\n  md-well li a {\n    padding: 5px;\n    display: inline-block;\n    width: 100%;\n  }\n  /*md-well li.active {\n    border-right: 2px solid #ea4a4f;\n    background-color: #ffebee;\n  }*/\n</style>\n  <ul class=\"z-depth-1\">\n      <li md-waves=\"color: primary;\" repeat.for=\"row of router.navigation\" class=\"${row.isActive ? 'active' : ''}\">\n          <a href.bind=\"row.href\">${row.title}</a>\n      </li>\n  </ul>\n</template>\n"; });