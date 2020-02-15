import React, { useEffect, useState, createContext, useCallback } from 'react';
import useReactRouter from 'use-react-router';
import { EventEmitter } from './services/EventEmitter';
import { Logger } from './logger';

const defaultWorkSettings = {
    workDayStartTime: '08:30', // not used
    workDayEndTime: '17:00', // not used
    splitTaskAfterIdlingForMinutes: 3, // not used in client, put used in backend
    hoursToWork: 8,
};

export const RootContext = createContext<any>({});

export const RootProvider = ({ children }) => {
    const { history } = useReactRouter();

    const prevWorkSettings = JSON.parse((window as any).localStorage.getItem('workSettings')) || {
        defaultWorkSettings,
    };

    const gotoSettingsPage = useCallback(() => {
        Logger.debug('Navigating to settings page');
        history.push('/app/settings');
    }, [history]);

    const [workSettings, setWorkSettings] = useState(prevWorkSettings);

    useEffect(() => {
        window.localStorage.setItem('workSettings', JSON.stringify(workSettings));
    }, [workSettings]);

    useEffect(() => {
        EventEmitter.on('side:preferences', gotoSettingsPage);
        return () => {
            Logger.debug('Clearing eventEmitter');
            EventEmitter.off('side:preferences', gotoSettingsPage);
        };
    }, [gotoSettingsPage]);

    const defaultContext = {
        workSettings,
        setWorkSettings,
    };

    return <RootContext.Provider value={defaultContext}>{children}</RootContext.Provider>;
};
