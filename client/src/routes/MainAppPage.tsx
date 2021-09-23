import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';
import { SummaryPage } from './SummaryPage';
import { TimelinePage } from './TimelinePage';
import { TrayAppPage } from './TrayAppPage';
import { SearchPage } from './SearchPage';
import { SupportPage } from './SupportPage';
import { UserProvider } from '../components/Paywall/UserProvider';

export function MainAppPage() {
    return (
        <UserProvider>
            <Switch>
                <Route exact path="/" component={TimelinePage} />
                <Route path="/app/timeline" component={TimelinePage} />
                <Route path="/app/settings" component={SettingsPage} />
                <Route path="/app/summary" component={SummaryPage} />
                <Route path="/app/support" component={SupportPage} />
                <Route path="/app/search" component={SearchPage} />
                <Route path="/app/trayApp" component={TrayAppPage} />
            </Switch>
        </UserProvider>
    );
}
