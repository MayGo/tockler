import { DateTime } from 'luxon';
import { createContext, useCallback, useEffect, useState } from 'react';
import {
    ISummary,
    ISummaryOnlineTime,
    summariseLog,
    summariseOnline,
    summariseTimeOnline,
} from './components/SummaryCalendar/SummaryCalendar.util';
import { Logger } from './logger';
import { findAllDayItemsForEveryTrack } from './services/trackItem.api';
import { CALENDAR_MODE } from './SummaryContext.util';

interface SummaryContextType {
    selectedDate: DateTime;
    setSelectedDate: (date: DateTime) => void;
    selectedMode: CALENDAR_MODE;
    setSelectedMode: (mode: CALENDAR_MODE) => void;
    logSummary: ISummary;
    onlineSummary: ISummary;
    onlineTimesSummary: ISummaryOnlineTime;
    isLoading: boolean;
}

export const SummaryContext = createContext<SummaryContextType>({
    selectedDate: DateTime.now(),
    setSelectedDate: () => {},
    selectedMode: CALENDAR_MODE.MONTH,
    setSelectedMode: () => {},
    logSummary: {},
    onlineSummary: {},
    onlineTimesSummary: {},
    isLoading: false,
});

export const SummaryProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(DateTime.now());
    const [selectedMode, setSelectedMode] = useState<CALENDAR_MODE>(CALENDAR_MODE.MONTH);

    const [logSummary, setLogSummary] = useState<ISummary>({});
    const [onlineSummary, setOnlineSummary] = useState<ISummary>({});
    const [onlineTimesSummary, setOnlineTimesSummary] = useState<ISummaryOnlineTime>({});

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            // TODO, query month +1 day for sleep time
            const beginDate = selectedDate.startOf(selectedMode.toLowerCase() as 'month' | 'week' | 'day');
            let endDate = selectedDate.endOf(selectedMode.toLowerCase() as 'month' | 'week' | 'day');

            if (selectedMode === CALENDAR_MODE.MONTH) {
                endDate = endDate.plus({ days: 1 });
            }

            const { statusItems, logItems } = await findAllDayItemsForEveryTrack(beginDate, endDate);
            setLogSummary(summariseLog(logItems, selectedMode));
            setOnlineSummary(summariseOnline(statusItems, selectedMode));
            setOnlineTimesSummary(summariseTimeOnline(statusItems, selectedMode, beginDate));
        } catch (e) {
            Logger.error('Error loading summary data.', e);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate, selectedMode]);

    const defaultContext = {
        selectedDate,
        setSelectedDate,
        selectedMode,
        setSelectedMode,
        logSummary,
        onlineSummary,
        onlineTimesSummary,
        isLoading,
    };

    useEffect(() => {
        loadData();
    }, [selectedDate, selectedMode]); // eslint-disable-line react-hooks/exhaustive-deps

    return <SummaryContext.Provider value={defaultContext}>{children}</SummaryContext.Provider>;
};
