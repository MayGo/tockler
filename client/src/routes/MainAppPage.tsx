import * as React from 'react';
import { Router, Route, Switch } from 'dva/router';
import { TimelinePage } from './TimelinePage';
import { SettingsPage } from './SettingsPage';
import { SummaryPage } from './SummaryPage';
import { TrayAppPage } from './TrayAppPage';

export default function MainRouterConfig({ history }: any) {
    return (
        <Router history={history}>
            <Switch>
                <Route exact={true} path="/" component={TimelinePage} />
                <Route path="/app/timeline" component={TimelinePage} />
                <Route path="/app/settings" component={SettingsPage} />
                <Route path="/app/summary" component={SummaryPage} />
                <Route path="/app/trayApp" component={TrayAppPage} />
            </Switch>
        </Router>
    );
}
