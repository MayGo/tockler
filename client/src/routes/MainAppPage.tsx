import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';
import { SummaryPage } from './SummaryPage';
import { TimelinePage } from './TimelinePage';
import { TrayAppPage } from './TrayAppPage';
import { TimelineProvider } from '../TimelineContext';
import { SearchPage } from './SearchPage';

export function MainAppPage({ history }: any) {
    return (
        <TimelineProvider>
            <Switch>
                <Route exact path="/" component={TimelinePage} />
                <Route path="/app/timeline" component={TimelinePage} />
                <Route path="/app/settings" component={SettingsPage} />
                <Route path="/app/summary" component={SummaryPage} />
                <Route path="/app/search" component={SearchPage} />
                <Route path="/app/trayApp" component={TrayAppPage} />
            </Switch>
        </TimelineProvider>
    );
}
