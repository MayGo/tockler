import * as React from 'react';

import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { RootProvider } from './RootContext';
import NotFound from './routes/404';
import { MainAppPage } from './routes/MainAppPage';
import { TrayAppPage } from './routes/TrayAppPage';
import { TimelineProvider } from './TimelineContext';

import { LocaleProvider } from 'antd';
import en_GB from 'antd/lib/locale-provider/en_GB';
import moment from 'moment';
import 'moment/locale/en-gb';

moment.locale('en-gb');
export function MainRouter() {
    return (
        <Router>
            <LocaleProvider locale={en_GB}>
                <RootProvider>
                    <TimelineProvider>
                        <Switch>
                            <Route path="/" exact component={MainAppPage} />
                            <Route path="/app" component={MainAppPage} />
                            <Route path="/trayApp" component={TrayAppPage} />
                            <Route path="*" component={NotFound} />
                        </Switch>
                    </TimelineProvider>
                </RootProvider>
            </LocaleProvider>
        </Router>
    );
}
