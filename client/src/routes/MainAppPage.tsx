import { Route, Routes } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';
import { SummaryPage } from './SummaryPage';
import { TimelinePage } from './TimelinePage';
import { TrayAppPage } from './TrayAppPage';
import { SearchPage } from './SearchPage';
import { SupportPage } from './SupportPage';
import { MainLayout } from '../components/MainLayout/MainLayout';

export function MainAppPage() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<TimelinePage />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="summary" element={<SummaryPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="trayApp" element={<TrayAppPage />} />
            </Route>
        </Routes>
    );
}
