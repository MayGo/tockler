const webpack = require('webpack');
const path = require('path');
const tsImportPluginFactory = require('ts-import-plugin');
const { getLoader } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');
const { injectBabelPlugin } = require('react-app-rewired');
const rewireReactHotLoader = require('react-app-rewire-hot-loader');

module.exports = function override(config, env) {
    if (env === 'production') {
        console.log('⚡ Production build with Optimization.');
        // return config;
    }
    // prettier-ignore
    const tsLoader = getLoader(
        config.module.rules,
        rule => rule.loader && typeof rule.loader === 'string' && rule.loader.includes('ts-loader')
    );

    tsLoader.options = {
        getCustomTransformers: () => ({
            before: [
                tsImportPluginFactory({
                    libraryName: 'antd',
                    libraryDirectory: 'es',
                    style: true,
                }),
            ],
        }),
    };
    config = rewireLess.withLoaderOptions({
        javascriptEnabled: true,
        modifyVars: {
            '@normal-color': '#fff',
            '@primary-color': '#8363ff',
            '@body-background': '#f8f8f8',
            '@component-background': '#f8f8f8',
        },
    })(config, env);

    delete config.node;
    config = Object.assign({}, config, { target: 'electron-renderer' });
    // config = rewireReactHotLoader(config, env);
    //config = injectBabelPlugin('react-hot-loader/babel', config);
    config = injectBabelPlugin(['dva-hmr', { container: '#root' }], config);
    return config;
};
