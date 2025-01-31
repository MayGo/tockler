import { useEffect, useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RootProvider } from './RootContext';
import { MainAppPage } from './routes/MainAppPage';
import { TrayAppPage } from './routes/TrayAppPage';
import moment from 'moment';
import 'moment/locale/en-gb';
import { EventEmitter } from './services/EventEmitter';
import { Logger } from './logger';
import { ChartThemeProvider } from './routes/ChartThemeProvider';
import { useGoogleAnalytics } from './useGoogleAnalytics';
import { useColorMode } from '@chakra-ui/react';
import { TrayPage } from './routes/TrayPage';
import { NotificationAppPage } from './routes/NotificationAppPage';

moment.locale('en-gb');

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
    }, [changeActiveTheme]); // eslint-disable-line react-hooks/exhaustive-deps

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
