import { useState, createContext, useContext, useEffect } from 'react';
import { Logger } from '../logger';
import { getChartTheme } from '../components/Timeline/ChartTheme';
import { THEMES } from '../store/theme.util';
import { useColorMode } from '@chakra-ui/react';

export const ChartThemeContext = createContext({ chartTheme: getChartTheme(false) });

export const ChartThemeProvider = ({ children }) => {
    const { colorMode } = useColorMode();
    const [chartTheme, setChartTheme] = useState(getChartTheme(false));

    const defaultContext = {
        chartTheme,
        setChartTheme,
    };

    useEffect(() => {
        Logger.info('Changing chartTheme', colorMode);

        setChartTheme(colorMode === THEMES.DARK ? getChartTheme(true) : getChartTheme(false));
    }, [colorMode]);
    return <ChartThemeContext.Provider value={defaultContext}>{children}</ChartThemeContext.Provider>;
};

export const useChartThemeState = () => {
    const context = useContext(ChartThemeContext);

    if (context === undefined) {
        throw new Error('useChartThemeState must be used within a ChartThemeContext');
    }

    return context;
};
