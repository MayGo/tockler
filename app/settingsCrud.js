const Settings = require('./db').Settings;
var $q = require('q');
/**
 * Module
 */

module.exports.findByName = function (name) {
    'use strict';
    return Settings.findOrCreate({
            where: {
                name: name
            }
        }
    );
};

module.exports.updateByName = function (name, data) {
    'use strict';
    return Settings.update({data: data}, {
            where: {
                name: name
            }
        }
    );
};