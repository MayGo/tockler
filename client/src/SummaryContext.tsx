import moment from 'moment';
import React, { createContext, useState, useCallback, useEffect } from 'react';
import { findAllDayItemsForEveryTrack } from './services/trackItem.api';
import {
    summariseLog,
    summariseOnline,
    summariseTimeOnline,
} from './components/SummaryCalendar/SummaryCalendar.util';

export const SummaryContext = createContext<any>({});

export const SummaryProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState<any>(false);
    const [selectedDate, setSelectedDate] = useState<any>(moment());
    const [selectedMode, setSelectedMode] = useState<any>('month');

    const [logSummary, setLogSummary] = useState<any>([]);
    const [onlineSummary, setOnlineSummary] = useState<any>([]);
    const [onlineTimesSummary, setOnlineTimesSummary] = useState<any>([]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const beginDate = moment(selectedDate).startOf(selectedMode);
        const endDate = moment(selectedDate).endOf(selectedMode);

        findAllDayItemsForEveryTrack(beginDate, endDate).then(
            ({ appItems, statusItems, logItems }) => {
                setLogSummary(summariseLog(logItems, selectedMode));
                setOnlineSummary(summariseOnline(statusItems, selectedMode));
                setOnlineTimesSummary(summariseTimeOnline(statusItems, selectedMode));
                setIsLoading(false);
            },
        );
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
