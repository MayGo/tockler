import { Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import { MainLayout } from '../components/MainLayout/MainLayout';
import { SearchPage } from './SearchPage';
import { SettingsPage } from './SettingsPage';
import { SummaryPage } from './SummaryPage';
import { SupportPage } from './SupportPage';
import { TimelinePage } from './TimelinePage';
import { TrayAppPage } from './TrayAppPage';

export function MainAppPage() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route
                    index
                    element={
                        <ErrorBoundary key="index">
                            <TimelinePage />
                        </ErrorBoundary>
                    }
                />
                <Route
                    path="timeline"
                    element={
                        <ErrorBoundary key="timeline">
                            <TimelinePage />
                        </ErrorBoundary>
                    }
                />
                <Route
                    path="settings"
                    element={
                        <ErrorBoundary key="settings">
                            <SettingsPage />
                        </ErrorBoundary>
                    }
                />
                <Route
                    path="summary"
                    element={
                        <ErrorBoundary key="summary">
                            <SummaryPage />
                        </ErrorBoundary>
                    }
                />
                <Route
                    path="support"
                    element={
                        <ErrorBoundary key="support">
                            <SupportPage />
                        </ErrorBoundary>
                    }
                />
                <Route
                    path="search"
                    element={
                        <ErrorBoundary key="search">
                            <SearchPage />
                        </ErrorBoundary>
                    }
                />
                <Route
                    path="trayApp"
                    element={
                        <ErrorBoundary key="trayApp">
                            <TrayAppPage />
                        </ErrorBoundary>
                    }
                />
            </Route>
        </Routes>
    );
}
