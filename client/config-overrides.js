const path = require('path');
const fs = require('fs');
const { override, fixBabelImports, addLessLoader, addWebpackPlugin } = require('customize-cra');

const AntDesignThemePlugin = require('antd-theme-webpack-plugin');
const { getLessVars } = require('antd-theme-generator');

const themeVariables = getLessVars(path.join(__dirname, './src/styles/vars.less'));
const defaultVars = getLessVars('./node_modules/antd/lib/style/themes/default.less');
const darkVars = {
    ...getLessVars('./node_modules/antd/lib/style/themes/dark.less'),
    '@primary-color': defaultVars['@primary-color'],
    '@picker-basic-cell-active-with-range-color': 'darken(@primary-color, 20%)',
};
const lightVars = {
    ...getLessVars('./node_modules/antd/lib/style/themes/compact.less'),
    '@primary-color': defaultVars['@primary-color'],
};
fs.writeFileSync('./src/dark.json', JSON.stringify(darkVars));
fs.writeFileSync('./src/light.json', JSON.stringify(lightVars));
fs.writeFileSync('./src/theme.json', JSON.stringify(themeVariables));

const options = {
    stylesDir: path.join(__dirname, './src'),
    antDir: path.join(__dirname, './node_modules/antd'),
    varFile: path.join(__dirname, './src/styles/vars.less'),
    themeVariables: Array.from(
        new Set([
            ...Object.keys(darkVars),
            ...Object.keys(lightVars),
            ...Object.keys(themeVariables),
        ]),
    ),
    publicPath: process.env.PUBLIC_URL || './',
    lessUrl: `${process.env.PUBLIC_URL || './'}less.min.js`,
    generateOnce: false, // generate color.less on each compilation
};

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
    addWebpackPlugin(new AntDesignThemePlugin(options)),
);
