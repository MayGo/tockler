const CracoLessPlugin = require('craco-less');

module.exports = {
    /*  webpack: {
        configure: {
            target: 'electron-renderer',
        },
    },*/
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: {
                            '@normal-color': '#fff',
                            '@primary-color': '#8363ff',
                            '@body-background': '#f8f8f8',
                            '@component-background': '#f8f8f8',
                        },
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
};
