import React, { useEffect, useCallback } from 'react';

import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { RootProvider } from './RootContext';
import { NotFound } from './routes/404';
import { MainAppPage } from './routes/MainAppPage';
import { TrayAppPage } from './routes/TrayAppPage';

import { ConfigProvider } from 'antd';
import moment from 'moment';
import 'moment/min/locales';
import { useAppDataState } from './routes/AppDataProvider';
import { ThemeProvider } from 'styled-components';
import { EventEmitter } from './services/EventEmitter';
import { Logger } from './logger';
import { getThemeFromStorage, saveThemeToStorage } from './services/settings.api';
import { ChartThemeProvider } from './routes/ChartThemeProvider';
import { useStoreActions, useStoreState } from './store/easyPeasy';

moment.locale('en-gb');

const savedTheme = getThemeFromStorage();

export function MainRouter() {
    const theme = useStoreState(state => state.theme);
    const setThemeWithVariables = useStoreActions(actions => actions.setThemeWithVariables);
    const setThemeByName = useStoreActions(actions => actions.setThemeByName);

    useEffect(() => {
        if (savedTheme && savedTheme.variables) {
            setThemeWithVariables(savedTheme);
        }
    }, [setThemeWithVariables]);

    const changeActiveTheme = useCallback(
        (event, themeName) => {
            setThemeByName(themeName);
        },
        [setThemeByName],
    );

    useEffect(() => {
        EventEmitter.on('activeThemeChanged', changeActiveTheme);
        return () => {
            Logger.debug('Clearing eventEmitter');
            EventEmitter.off('activeThemeChanged', changeActiveTheme);
        };
    }, [changeActiveTheme]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        saveThemeToStorage(theme);
    }, [theme]);

    const state: any = useAppDataState();

    return (
        <Router>
            <ConfigProvider locale={state.locale}>
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
            </ConfigProvider>
        </Router>
    );
}
