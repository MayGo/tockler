import { Logger } from '../logger';
import darkVars from '../dark.json';
import lightVars from '../light.json';

export const THEMES = { LIGHT: 'default', DARK: 'dark' };

export const themes = { [THEMES.LIGHT]: lightVars, [THEMES.DARK]: darkVars };

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

    modifyVars(variables);

    return variables;
};

export const modifyVars = vars => {
    (window as any).less
        .modifyVars(vars)
        .then(() => {
            Logger.debug(`Successfully updated theme`, vars, themes);
        })
        .catch(error => {
            Logger.error(`Failed to update theme`, error);
        });
};
