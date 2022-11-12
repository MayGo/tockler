const name = 'DATA_SETTINGS';
exports.up = async function (knex) {
    const newSettings = { idleAfterSeconds: 60, backgroundJobInterval: 3 };
    const subQuery = knex('Settings').where({ name });
    return subQuery.then((response) => {
        if (response.length > 0) {
            return subQuery.update({ jsonData: JSON.stringify(newSettings) });
        } else {
            return subQuery.insert({ name, jsonData: JSON.stringify(newSettings) });
        }
    });
};

exports.down = function () {};
