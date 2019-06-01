import React, { useEffect, useState } from 'react';

const defaultWorkSettings = {
    workDayStartTime: '08:30', // not used
    workDayEndTime: '17:00', // not used
    splitTaskAfterIdlingForMinutes: 3, // not used in client, put used in backend
    hoursToWork: 8,
};

export const RootContext = React.createContext<any>({});

export const RootProvider = ({ children }) => {
    const prevWorkSettings = JSON.parse((window as any).localStorage.getItem('workSettings')) || {
        defaultWorkSettings,
    };

    const [workSettings, setWorkSettings] = useState(prevWorkSettings);

    useEffect(() => {
        window.localStorage.setItem('workSettings', JSON.stringify(workSettings));
    }, [workSettings]);
    const defaultContext = {
        workSettings,
        setWorkSettings,
    };

    return <RootContext.Provider value={defaultContext}>{children}</RootContext.Provider>;
};
