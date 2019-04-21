import React, { useEffect, useState } from 'react';

export const RootContext = React.createContext();
export const RootProvider = ({ children }) => {
    const prevWorkSettings = JSON.parse(window.localStorage.getItem('workSettings')) || {
        hoursToWork: 8,
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
