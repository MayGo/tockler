import React from 'react';

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

moment.locale('en-gb');

export function MainRouter() {
    const [theme, setTheme] = React.useState(ThemeVariables[THEME_LIGHT]);

    const state: any = useAppDataState();

    return (
        <Router>
            <ConfigProvider locale={state.locale}>
                <AntdThemeProvider theme={theme} onChange={value => setTheme(value)}>
                    <ThemeProvider theme={theme}>
                        <RootProvider>
                            <Switch>
                                <Route path="/" exact component={MainAppPage} />
                                <Route path="/app" component={MainAppPage} />
                                <Route path="/trayApp" component={TrayAppPage} />
                                <Route path="*" component={NotFound} />
                            </Switch>
                        </RootProvider>
                    </ThemeProvider>
                </AntdThemeProvider>
            </ConfigProvider>
        </Router>
    );
}
