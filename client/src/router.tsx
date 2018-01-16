import * as React from 'react';

import { Router, Route, Switch } from 'dva/router';
import { TimelinePage } from './routes/TimelinePage';
import NotFound from './routes/404';
import { SettingsPage } from './routes/SettingsPage';
import hot from 'dva-hot';
import { SummaryPage } from './routes/SummaryPage';

function RouterConfig({ history }: any) {
    return (
        <Router history={history}>
            <Switch>
                <Route path="/" exact component={TimelinePage} />
                <Route path="/timeline" component={TimelinePage} />
                <Route path="/settings" component={SettingsPage} />
                <Route path="/summary" component={SummaryPage} />
                <Route path="*" component={NotFound} />
            </Switch>
        </Router>
    );
}

export default hot.router(module)(RouterConfig);
