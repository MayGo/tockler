import * as React from 'react';

import { Router, Route, Switch } from 'dva/router';
import { TimelinePage } from './routes/TimelinePage';
import NotFound from './routes/404';
import { SettingsPage } from './routes/SettingsPage';

export default function({ history }: any) {
    return (
        <Router history={history}>
            <Switch>
                <Route path="/" component={TimelinePage} />
                <Route path="/timeline" component={TimelinePage} />
                <Route path="/settings" component={SettingsPage} />
                <Route path="*" component={NotFound} />
            </Switch>
        </Router>
    );
}
