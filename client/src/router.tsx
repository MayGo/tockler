import * as React from 'react';

import { Router, Route, Switch } from 'dva/router';
import { TimelinePage } from './routes/TimelinePage';
import NotFound from './routes/404';
import { SettingsPage } from './routes/SettingsPage';
// import hot from 'dva-hot';
import { SummaryPage } from './routes/SummaryPage';

import { TrayAppPage } from './routes/TrayAppPage';
import { TrayPage } from './routes/TrayPage';

function RouterConfig({ history }: any) {
    return (
        <Router history={history}>
            <Switch>
                <Route path="/" exact={true} component={TimelinePage} />
                <Route path="/timeline" component={TimelinePage} />
                <Route path="/settings" component={SettingsPage} />
                <Route path="/summary" component={SummaryPage} />
                <Route path="/tray" component={TrayPage} />
                <Route path="/trayApp" component={TrayAppPage} />
                <Route path="*" component={NotFound} />
            </Switch>
        </Router>
    );
}

// export default hot.router(module)(RouterConfig);
export default RouterConfig;
