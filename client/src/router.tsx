import * as React from 'react';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { RootProvider } from './RootContext';
import NotFound from './routes/404';
import MainAppPage from './routes/MainAppPage';
import { TrayAppPage } from './routes/TrayAppPage';
import { TimelineProvider } from './TimelineContext';

export function MainRouter() {
    return (
        <Router>
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
        </Router>
    );
}
