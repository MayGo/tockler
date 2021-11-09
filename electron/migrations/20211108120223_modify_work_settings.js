const name = 'WORK_SETTINGS';
exports.up = async function (knex) {
    const subQuery = knex('Settings').where({ name });
    return subQuery.then((response) => {
        if (response.length > 0) {
            const workSettingsRaw = response[0].jsonData;

            const workSettings = JSON.parse(workSettingsRaw);

            const newSettings = {
                ...workSettings,
                minBreakTime: 5,
                notificationDuration: 10,
                reNotifyInterval: 5,
                smallNotificationsEnabled: true,
            };
            return subQuery.update({ jsonData: JSON.stringify(newSettings) });
        }
    });
};

exports.down = function () {};
