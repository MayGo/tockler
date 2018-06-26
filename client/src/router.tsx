import * as React from 'react';
import dynamic from 'dva/dynamic';
import { Router, Route, Switch } from 'dva/router';

import { TimelinePage } from './routes/TimelinePage';
import NotFound from './routes/404';
import { SettingsPage } from './routes/SettingsPage';
import { SummaryPage } from './routes/SummaryPage';
import { TrayAppPage } from './routes/TrayAppPage';

import { timelineModel } from './models/timeline';
import { rootModel } from './models/root';
import { trayModel } from './models/tray';
import { settingsModel } from './models/settings';
import { summaryModel } from './models/summary';

import MainAppPage from './routes/MainAppPage';

function RouterConfig({ history, app }: any) {
    const DynamicMainAppPage = (dynamic as any)({
        app: app,
        models: () => [timelineModel, rootModel, settingsModel, summaryModel],
        component: () => MainAppPage,
    });
    const DynamicTrayAppPage = (dynamic as any)({
        app: app,
        models: () => [trayModel],
        component: () => TrayAppPage,
    });

    return (
        <Router history={history}>
            <Switch>
                <Route path="/" exact={true} component={DynamicMainAppPage} />
                <Route path="/app" component={DynamicMainAppPage} />
                <Route path="/trayApp" component={DynamicTrayAppPage} />
                <Route path="*" component={NotFound} />
            </Switch>
        </Router>
    );
}

// export default hot.router(module)(RouterConfig);
export default RouterConfig;
