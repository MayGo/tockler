const {
    override,
    fixBabelImports,
    addLessLoader,
    addPostcssPlugins,
    adjustStyleLoaders,
    addWebpackPlugin,
} = require('customize-cra');

const AntdThemePlugin = require('antd-theme/plugin');

module.exports = override(
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
        lessOptions: {
            javascriptEnabled: true,
        },
    }),
    /*adjustStyleLoaders(loaders => {
        loaders.use[0] = {
            loader: AntdThemePlugin.loader,
        };
    }),*/
    /*    addWebpackPlugin(
        new AntdThemePlugin({
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
    ),*/
);
