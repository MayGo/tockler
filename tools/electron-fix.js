// https://github.com/aurelia/cli/issues/217
define("electron", ['exports'], function (exports) {
  if (window.nodeRequire) {
    var electron = window.nodeRequire("electron");

    exports["default"] = electron;

    for (var key in electron) {
      exports[key] = electron[key];
    }
  }
});
