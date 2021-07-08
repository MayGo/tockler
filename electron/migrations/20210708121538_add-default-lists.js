exports.up = function (knex) {
    const now = new Date();
    const whitelistRows = [
        {
            app: 'Code',
        },
        {
            app: 'Xcode',
        },
        {
            app: 'Visual Studio',
        },
        {
            app: 'PyCharm',
        },
        {
            app: 'WebStorm',
        },
        {
            app: 'IntelliJ',
        },
        {
            app: 'Android Studio',
        },
        {
            app: 'Atom',
        },
        {
            app: 'Electron',
        },
        {
            app: 'Eclipse',
        },
        {
            app: 'DevTime',
        },
        {
            app: 'Terminal',
        },
        {
            app: 'iTerm',
        },
        {
            app: 'Powershell',
        },
        {
            app: 'Vim',
        },
        {
            app: 'Emacs',
        },
        {
            app: 'Postico',
        },
        {
            app: 'Figma',
        },
        {
            app: 'Zoom',
        },
        {
            app: 'Tandem',
        },
        {
            app: 'Slack',
        },
        {
            app: 'Workplace Chat',
        },
        {
            app: 'Notion',
        },
        {
            title: 'localhost',
        },
        {
            title: 'Figma',
        },
        {
            title: 'Notion',
        },
        {
            title: 'Github',
        },
        {
            title: 'Murcul',
        },
        {
            title: 'GitStart',
        },
        {
            title: 'client-',
        },
        {
            url: 'github',
        },
        {
            url: 'gitstart',
        },
        {
            url: 'notion.so',
        },
        {
            url: 'gitstart.workplace.com',
        },
        {
            url: 'stackoverflow.com',
        },
        {
            url: 'atlassian.net',
        },
        {
            url: 'slack',
        },
        {
            url: 'teams.microsoft.com',
        },
        {
            url: 'calendar.google.com',
        },
        {
            url: 'localhost',
        },
    ].map((item) => ({
        createdAt: now,
        updatedAt: now,
        ...item,
    }));

    const blacklistRows = [
        {
            app: 'Spotify',
        },
        {
            app: 'WhatsApp',
        },
        {
            title: 'WhatsApp',
        },
        {
            title: 'Facebook',
        },
        {
            title: 'Instagram',
        },
        {
            url: '9gag.com',
        },
        {
            url: 'facebook.com',
        },
        {
            url: 'netflix.com',
        },
    ].map((item) => ({
        createdAt: now,
        updatedAt: now,
        ...item,
    }));

    return Promise.all([
        knex.batchInsert('Whitelist', whitelistRows),
        knex.batchInsert('Blacklist', blacklistRows),
    ]);
};

exports.down = function (knex) {};
