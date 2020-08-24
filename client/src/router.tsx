import React from 'react';

import { ThemeProvider } from 'antd-theme';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { RootProvider } from './RootContext';
import NotFound from './routes/404';
import { MainAppPage } from './routes/MainAppPage';
import { TrayAppPage } from './routes/TrayAppPage';

import { ConfigProvider } from 'antd';
import moment from 'moment';
import 'moment/min/locales';
import { useAppDataState } from './routes/AppDataProvider';

moment.locale('en-gb');

const initialTheme: any = {
    name: 'default',
    variables: {
        '@normal-color': '#fff',
        '@primary-color': '#8363ff',
        '@body-background': '#f8f8f8',
        '@component-background': '#f8f8f8',
    },
};
export function MainRouter() {
    const [theme, setTheme] = React.useState(initialTheme);
    const state: any = useAppDataState();
    return (
        <Router>
            <ConfigProvider locale={state.locale}>
                <ThemeProvider theme={theme} onChange={value => setTheme(value)}>
                    <RootProvider>
                        <Switch>
                            <Route path="/" exact component={MainAppPage} />
                            <Route path="/app" component={MainAppPage} />
                            <Route path="/trayApp" component={TrayAppPage} />
                            <Route path="*" component={NotFound} />
                        </Switch>
                    </RootProvider>
                </ThemeProvider>
            </ConfigProvider>
        </Router>
    );
}
