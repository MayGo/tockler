import moment from 'moment';
import React, { createContext, useState, useCallback, useEffect } from 'react';
import { findAllDayItemsForEveryTrack } from './services/trackItem.api';
import {
    summariseLog,
    summariseOnline,
    summariseTimeOnline,
} from './components/SummaryCalendar/SummaryCalendar.util';
import { Logger } from './logger';
import { MODE_MONTH } from './SummaryContext.util';

export const SummaryContext = createContext<any>({});

export const SummaryProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState<any>(false);
    const [selectedDate, setSelectedDate] = useState<any>(moment());
    const [selectedMode, setSelectedMode] = useState<any>(MODE_MONTH);

    const [logSummary, setLogSummary] = useState<any>([]);
    const [onlineSummary, setOnlineSummary] = useState<any>([]);
    const [onlineTimesSummary, setOnlineTimesSummary] = useState<any>([]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            // TODO, query month +1 day for sleep time
            const beginDate = moment(selectedDate).startOf(selectedMode);
            const endDate = moment(selectedDate).endOf(selectedMode);

            if (selectedMode === MODE_MONTH) {
                endDate.add(1, 'day');
            }
            const { statusItems, logItems } = await findAllDayItemsForEveryTrack(
                beginDate,
                endDate,
            );
            setLogSummary(summariseLog(logItems, selectedMode));
            setOnlineSummary(summariseOnline(statusItems, selectedMode));
            setOnlineTimesSummary(summariseTimeOnline(statusItems, selectedMode, beginDate));
        } catch (e) {
            Logger.error('Errod loading summary data.', e);
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
