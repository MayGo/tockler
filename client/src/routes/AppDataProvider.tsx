import React, { useState, createContext, useContext } from 'react';

import enGB from 'antd/es/locale/en_GB';

export const AppDataContext = createContext({});

export const AppDataProvider = ({ children }) => {
    const [locale, setLocale] = useState(enGB);

    const defaultContext = {
        locale,
        setLocale,
    };

    return <AppDataContext.Provider value={defaultContext}>{children}</AppDataContext.Provider>;
};

export const useAppDataState = () => {
    const context = useContext(AppDataContext);

    if (context === undefined) {
        throw new Error('useAppDataState must be used within a AppDataContext');
    }

    return context;
};
