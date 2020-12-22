import React, { useState, createContext, useContext, useEffect } from 'react';
import { Logger } from '../logger';
import { getChartTheme } from '../components/Timeline/ChartTheme';
import { THEMES } from '../store/theme.util';

export const ChartThemeContext = createContext({ chartTheme: getChartTheme(false) });

export const ChartThemeProvider = ({ theme, children }) => {
    const [chartTheme, setChartTheme] = useState(getChartTheme(false));

    const defaultContext = {
        chartTheme,
        setChartTheme,
    };

    useEffect(() => {
        Logger.info('Changing chartTheme');

        setChartTheme(theme.name === THEMES.DARK ? getChartTheme(true) : getChartTheme(false));
    }, [theme]);
    return (
        <ChartThemeContext.Provider value={defaultContext}>{children}</ChartThemeContext.Provider>
    );
};

export const useChartThemeState = () => {
    const context = useContext(ChartThemeContext);

    if (context === undefined) {
        throw new Error('useChartThemeState must be used within a ChartThemeContext');
    }

    return context;
};
