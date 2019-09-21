const { override, fixBabelImports, addLessLoader, addBabelPlugin } = require('customize-cra');

const addWebpackTarget = target => config => {
    config.target = target;
    return config;
};

module.exports = {
    target: 'electron-renderer',
    webpack: override(
        fixBabelImports('import', {
            libraryName: 'antd',
            libraryDirectory: 'es',
            style: 'css',
        }),
        addLessLoader({
            javascriptEnabled: true,
            modifyVars: {
                '@normal-color': '#fff',
                '@primary-color': '#8363ff',
                '@body-background': '#f8f8f8',
                '@component-background': '#f8f8f8',
            },
        }),
    ),
};
