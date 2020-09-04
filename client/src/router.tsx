import React, { useEffect, useCallback } from 'react';

import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { RootProvider } from './RootContext';
import NotFound from './routes/404';
import { MainAppPage } from './routes/MainAppPage';
import { TrayAppPage } from './routes/TrayAppPage';

import { ConfigProvider } from 'antd';
import moment from 'moment';
import 'moment/min/locales';
import { useAppDataState } from './routes/AppDataProvider';
import { AntdThemeProvider } from './routes/AntdThemeProvider';
import { ThemeProvider } from 'styled-components';
import { ThemeVariables, THEME_LIGHT } from './constants';
import { EventEmitter } from './services/EventEmitter';
import { Logger } from './logger';
import { getTheme, saveTheme } from './services/settings.api';
import { ChartThemeProvider } from './routes/ChartThemeProvider';

moment.locale('en-gb');

export function MainRouter() {
    const savedTheme = getTheme();

    const [theme, setTheme] = React.useState(savedTheme || ThemeVariables[THEME_LIGHT]);

    const changeActiveTheme = useCallback(
        (event, themeName) => {
            const themeVariables = ThemeVariables[themeName];
            if (themeVariables) {
                setTheme(themeVariables);
            } else {
                Logger.error('No such theme:', themeName);
            }
        },
        [setTheme],
    );

    useEffect(() => {
        EventEmitter.on('activeThemeChanged', changeActiveTheme);
        return () => {
            Logger.debug('Clearing eventEmitter');
            EventEmitter.off('activeThemeChanged', changeActiveTheme);
        };
    }, [changeActiveTheme]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        saveTheme(theme);
        Logger.info('Theme saved:', theme);
    }, [theme]);

    const state: any = useAppDataState();

    return (
        <Router>
            <ConfigProvider locale={state.locale}>
                <AntdThemeProvider theme={theme} onChange={value => setTheme(value)}>
                    <ThemeProvider theme={theme}>
                        <ChartThemeProvider theme={theme}>
                            <RootProvider>
                                <Switch>
                                    <Route path="/" exact component={MainAppPage} />
                                    <Route path="/app" component={MainAppPage} />
                                    <Route path="/trayApp" component={TrayAppPage} />
                                    <Route path="*" component={NotFound} />
                                </Switch>
                            </RootProvider>
                        </ChartThemeProvider>
                    </ThemeProvider>
                </AntdThemeProvider>
            </ConfigProvider>
        </Router>
    );
}
