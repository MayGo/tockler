import { useEffect, useState, createContext, useCallback } from 'react';
import { EventEmitter } from './services/EventEmitter';
import { Logger } from './logger';
import { fetchDataSettings, fetchWorkSettings, saveDataSettings, saveWorkSettings } from './services/settings.api';
import { WorkSettingsI } from './components/Settings/WorkForm.util';
import { useNavigate } from 'react-router-dom';
import { DataSettingsI } from './components/Settings/DataForm.util';

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
const defaultDataSettings = {
    idleAfterSeconds: 60,
    backgroundJobInterval: 3,
};

export const RootContext = createContext<any>({});

export const RootProvider = ({ children }) => {
    const navigate = useNavigate();

    const gotoSettingsPage = useCallback(() => {
        Logger.debug('Navigating to settings page');
        navigate('/settings');
    }, [navigate]);

    const [workSettings, setWorkSettings] = useState<WorkSettingsI>(defaultWorkSettings);
    const [dataSettings, setDataSettings] = useState<DataSettingsI>(defaultDataSettings);

    const updateWorkSettings = useCallback((newWorkSettings) => {
        setWorkSettings(newWorkSettings);
        saveWorkSettings(newWorkSettings);
    }, []);

    const updateDataSettings = useCallback((newDataSettings) => {
        setDataSettings(newDataSettings);
        saveDataSettings(newDataSettings);
    }, []);

    const loadSettings = useCallback(async () => {
        const newWorkSettings = await fetchWorkSettings();

        if (newWorkSettings) {
            setWorkSettings(newWorkSettings);
        }
        const newDataSettings = await fetchDataSettings();

        if (newDataSettings) {
            setDataSettings(newDataSettings);
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
        dataSettings,
        updateDataSettings,
    };

    return <RootContext.Provider value={defaultContext}>{children}</RootContext.Provider>;
};
