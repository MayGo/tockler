import { Logger } from '../logger';

export const THEMES = { LIGHT: 'light', DARK: 'dark' };

export const themes = { [THEMES.LIGHT]: {}, [THEMES.DARK]: {} };

export const PRIMARY_COLOR_VAR = '@primary-color';
export const ThemeVariables: any = {
    [THEMES.DARK]: {
        '@normal-color': '#0e0e0e',
        [PRIMARY_COLOR_VAR]: '#8363ff',
        '@body-background': '#303030',
        '@component-background': '#0e0e0e',
    },
    [THEMES.LIGHT]: {
        '@normal-color': '#ffffff',
        [PRIMARY_COLOR_VAR]: '#8363ff',
        '@body-background': '#f8f8f8',
        '@component-background': '#ffffff',
    },
};

export const setThemeVars = (themeName, customVariables = {}) => {
    if (!themeName) {
        Logger.error(`No theme name`);
        return;
    }

    const t = themes[themeName];
    if (!t) {
        Logger.error(`No theme with name ${themeName}`);
        return;
    }

    const variables = { ...themes[themeName], ...ThemeVariables[themeName], ...customVariables };

    return variables;
};
