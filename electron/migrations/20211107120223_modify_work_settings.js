const name = 'WORK_SETTINGS';
exports.up = async function (knex) {
    const subQuery = knex('Settings').where({ name });
    return subQuery.then((response) => {
        if (response.length > 0) {
            let workSettings;
            const workSettingsRaw = response[0].jsonData;

            try {
                workSettings = JSON.parse(workSettingsRaw);
            } catch (error) {
                console.error('Error parsing workSettings in migration.');
                // Just in case, there is error in JSON
                workSettings = { hoursToWork: 8 };
            }

            const newSettings = { ...workSettings, hoursToWork: 8, sessionLength: 60 };
            return subQuery.update({ jsonData: JSON.stringify(newSettings) });
        } else {
            const newSettings = { hoursToWork: 8, sessionLength: 60 };
            return subQuery.insert({ name, jsonData: JSON.stringify(newSettings) });
        }
    });
};

exports.down = function () {};
