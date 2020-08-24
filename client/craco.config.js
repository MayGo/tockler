const CracoLessPlugin = require('craco-less');

const AntdThemePlugin = require('antd-theme/plugin');
const ThemeLoaderPlugin = require('./theme.loader.webpack');

module.exports = {
    /*  webpack: {
        configure: {
            target: 'electron-renderer',
        },
    },*/

    webpack: {
        plugins: [
            new AntdThemePlugin({
                // Variables declared here can be modified at runtime
                variables: ['primary-color'],
                themes: [
                    {
                        name: 'dark',
                        filename: require.resolve('antd/lib/style/themes/dark.less'),
                    },
                    {
                        name: 'compact',
                        filename: require.resolve('antd/lib/style/themes/compact.less'),
                    },
                ],
            }),
        ],
    },
    babel: {
        loaderOptions: {
            plugins: [
                [
                    'import',
                    {
                        libraryName: 'antd',
                        style: true,
                    },
                ],
            ],
        },
    },
    plugins: [
        {
            plugin: ThemeLoaderPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        compress: true,
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
};
