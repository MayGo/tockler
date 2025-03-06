import { useColorMode } from '@chakra-ui/react';
import { StoreProvider } from 'easy-peasy';
import { Settings } from 'luxon';
import { useCallback, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Logger } from './logger';
import { RootProvider } from './RootContext';
import { ChartThemeProvider } from './routes/ChartThemeProvider';
import { MainAppPage } from './routes/MainAppPage';
import { NotificationAppPage } from './routes/NotificationAppPage';
import { TrayAppPage } from './routes/TrayAppPage';
import { TrayPage } from './routes/TrayPage';
import { EventEmitter } from './services/EventEmitter';
import { mainStore } from './store/mainStore';
import { useGoogleAnalytics } from './useGoogleAnalytics';

Settings.defaultLocale = 'en-GB';

export function MainRouter() {
    useGoogleAnalytics();
    const { setColorMode } = useColorMode();

    const changeActiveTheme = useCallback(
        (themeName) => {
            setColorMode(themeName);
        },
        [setColorMode],
    );

    useEffect(() => {
        EventEmitter.on('activeThemeChanged', changeActiveTheme);

        return () => {
            Logger.debug('Clearing eventEmitter');
            EventEmitter.off('activeThemeChanged', changeActiveTheme);
        };
    }, [changeActiveTheme]);

    return (
        <ChartThemeProvider>
            <RootProvider>
                <Routes>
                    {/* Main App with main store */}
                    <Route
                        path="/app/*"
                        element={
                            <StoreProvider store={mainStore}>
                                <MainAppPage />
                            </StoreProvider>
                        }
                    />

                    {/* Redirect from root to /app */}
                    <Route path="/" element={<Navigate to="/app" replace />} />

                    {/* Tray App - No longer needs trayStore */}
                    <Route path="/trayApp" element={<TrayAppPage />} />

                    <Route path="/notificationApp" element={<NotificationAppPage />} />
                    <Route path="/trayPage" element={<TrayPage />} />

                    {/* Fallback redirect to /app */}
                    <Route path="*" element={<Navigate to="/app" replace />} />
                </Routes>
            </RootProvider>
        </ChartThemeProvider>
    );
}
