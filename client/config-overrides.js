const path = require('path');

const ignorePath = function(exclude = [], config) {
    const rule = config.module.rules[0];
    if (!rule) {
        console.log('js related rule not found');
        return config;
    }
    rule.exclude = exclude.concat(rule.exclude || []);
    return config;
};

module.exports = function override(webpackConfig, env) {
    // Make it run in electron renderer process
    // If we want electron start, we will set cross-env BROWSER=none
    // if (process.env.BROWSER === 'none') {
    //delete config.node;
    //config.target = 'electron-renderer';
    //    }

    /* config = ignorePath(
        [path.resolve(__dirname, 'src/node_modules'), path.resolve(__dirname, 'src/~')],
        config,
    );*/

    if (env === 'production') {
        console.log('⚡ Production build with Optimization.');
    }

    delete webpackConfig.node;
    return Object.assign({}, webpackConfig, {
        target: 'electron-renderer',
    });
};
