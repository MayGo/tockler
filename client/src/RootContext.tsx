import React, { useEffect, useState, createContext, useCallback } from 'react';
import { useHistory } from 'react-router';
import { EventEmitter } from './services/EventEmitter';
import { Logger } from './logger';
import { fetchWorkSettings, saveWorkSettings } from './services/settings.api';
import { WorkSettingsI } from './components/Settings/WorkForm.util';

const defaultWorkSettings = {
    workDayStartTime: '08:30', // not used
    workDayEndTime: '17:00', // not used
    splitTaskAfterIdlingForMinutes: 3, // not used in client, put used in backend
    hoursToWork: 8, // not used
    sessionLength: 50,
    minBreakTime: 5,
    notificationDuration: 10,
    reNotifyInterval: 5,
    smallNotificationsEnabled: true,
};

export const RootContext = createContext<any>({});

export const RootProvider = ({ children }) => {
    const history = useHistory();

    const gotoSettingsPage = useCallback(() => {
        Logger.debug('Navigating to settings page');
        history.push('/app/settings');
    }, [history]);

    const [workSettings, setWorkSettings] = useState<WorkSettingsI>(defaultWorkSettings);

    const updateWorkSettings = useCallback((newWorkSettings) => {
        setWorkSettings(newWorkSettings);
        saveWorkSettings(newWorkSettings);
    }, []);

    const loadSettings = useCallback(async () => {
        const newWorkSettings = await fetchWorkSettings();

        if (newWorkSettings) {
            setWorkSettings(newWorkSettings);
        }
    }, []);

    useEffect(() => {
        loadSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        EventEmitter.on('WORK_SETTINGS_UPDATED', loadSettings);

        return () => {
            EventEmitter.off('WORK_SETTINGS_UPDATED', loadSettings);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        EventEmitter.on('side:preferences', gotoSettingsPage);
        return () => {
            Logger.debug('Clearing eventEmitter');
            EventEmitter.off('side:preferences', gotoSettingsPage);
        };
    }, [gotoSettingsPage]);

    const defaultContext = {
        workSettings,
        updateWorkSettings,
    };

    return <RootContext.Provider value={defaultContext}>{children}</RootContext.Provider>;
};
