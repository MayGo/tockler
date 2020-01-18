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


moment.locale('en-gb');
export function MainRouter() {
    const state: any = useAppDataState();
    return (
        <Router>
            <ConfigProvider locale={state.locale}>
                <RootProvider>
                    <Switch>
                        <Route path="/" exact component={MainAppPage} />
                        <Route path="/app" component={MainAppPage} />
                        <Route path="/trayApp" component={TrayAppPage} />
                        <Route path="*" component={NotFound} />
                    </Switch>
                </RootProvider>
            </ConfigProvider>
        </Router>
    );
}
