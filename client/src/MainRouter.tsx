import { useColorMode } from '@chakra-ui/react';
import { Settings } from 'luxon';
import { useCallback, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Logger } from './logger';
import { RootProvider } from './RootContext';
import { ChartThemeProvider } from './routes/ChartThemeProvider';
import { MainAppPage } from './routes/MainAppPage';
import { NotificationAppPage } from './routes/NotificationAppPage';
import { TrayAppPage } from './routes/TrayAppPage';
import { TrayPage } from './routes/TrayPage';
import { EventEmitter } from './services/EventEmitter';
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
                    <Route path="*" element={<MainAppPage />} />

                    <Route path="/trayApp" element={<TrayAppPage />} />
                    <Route path="/notificationApp" element={<NotificationAppPage />} />
                    <Route path="/trayPage" element={<TrayPage />} />
                </Routes>
            </RootProvider>
        </ChartThemeProvider>
    );
}
