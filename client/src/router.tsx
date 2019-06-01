import * as React from 'react';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NotFound from './routes/404';
import { TrayAppPage } from './routes/TrayAppPage';
import MainAppPage from './routes/MainAppPage';
import { RootProvider } from './RootContext';
import { TimelineProvider } from './TimelineContext';

export function MainRouter() {
    return (
        <RootProvider>
            <TimelineProvider>
                <Router>
                    <Switch>
                        <Route path="/" exact={true} component={MainAppPage} />
                        <Route path="/app" component={MainAppPage} />
                        <Route path="/trayApp" component={TrayAppPage} />
                        <Route path="*" component={NotFound} />
                    </Switch>
                </Router>
            </TimelineProvider>
        </RootProvider>
    );
}
