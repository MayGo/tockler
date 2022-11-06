import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';
import { SummaryPage } from './SummaryPage';
import { TimelinePage } from './TimelinePage';
import { TrayAppPage } from './TrayAppPage';
import { SearchPage } from './SearchPage';
import { SupportPage } from './SupportPage';

export function MainAppPage() {
    return (
        <Routes>
            <Route index path="/" element={<TimelinePage />} />
            <Route path="/app/timeline" element={<TimelinePage />} />
            <Route path="/app/settings" element={<SettingsPage />} />
            <Route path="/app/summary" element={<SummaryPage />} />
            <Route path="/app/support" element={<SupportPage />} />
            <Route path="/app/search" element={<SearchPage />} />
            <Route path="/app/trayApp" element={<TrayAppPage />} />
        </Routes>
    );
}
