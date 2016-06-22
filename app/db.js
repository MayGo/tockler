var LinvoDB = require("linvodb3");
var Config = require("./config");
var fs = require('fs');
LinvoDB.defaults.store = {
    db: require("medeadown")
};

try {
    fs.mkdirSync(Config.db.path);
    console.log("Creating folder " + Config.db.path);
} catch (e) {
    if (e.code !== 'EEXIST') throw e;
    console.log("Using existing folder " + Config.db.path);
}
LinvoDB.dbPath = Config.db.path;

/**
 * Schemas
 */
var TrackItem = new LinvoDB('TrackItem', {});
module.exports.TrackItem = TrackItem;

