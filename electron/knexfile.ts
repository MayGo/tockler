const path = require('path');
const OS = require('os');

const useRealDataInDev = false;
const samplePath = path.join(
    `/Users/${OS.userInfo().username}/Library/Application Support/Electron`,
    'tracker.db',
);

console.error('Sample db path:' + samplePath);

module.exports = {
    development: {
        client: 'sqlite3',
        connection: {
            database: 'bdgt',
            user: 'username',
            password: 'password',
            filename: path.join(samplePath, 'tracker.db'),
        },

        useNullAsDefault: true,
    },
};
