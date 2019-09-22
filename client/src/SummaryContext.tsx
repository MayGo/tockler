import moment from 'moment';
import React from 'react';
import { TrackItemService } from './services/TrackItemService';
import {
    summariseLog,
    summariseOnline,
    summariseTimeOnline,
} from './components/SummaryCalendar/SummaryCalendar.util';

export const SummaryContext = React.createContext<any>({});

export const SummaryProvider = ({ children }) => {
    const [isLoading, setIsLoading] = React.useState<any>(false);
    const [selectedDate, setSelectedDate] = React.useState<any>(moment());
    const [selectedMode, setSelectedMode] = React.useState<any>('month');

    const [logSummary, setLogSummary] = React.useState<any>([]);
    const [onlineSummary, setOnlineSummary] = React.useState<any>([]);
    const [onlineTimesSummary, setOnlineTimesSummary] = React.useState<any>([]);

    const loadData = React.useCallback(async () => {
        setIsLoading(true);
        const beginDate = moment(selectedDate).startOf(selectedMode);
        const endDate = moment(selectedDate).endOf(selectedMode);

        TrackItemService.findAllItems(beginDate, endDate).then(
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

    React.useEffect(() => {
        loadData();
    }, [selectedDate, selectedMode]); // eslint-disable-line react-hooks/exhaustive-deps

    return <SummaryContext.Provider value={defaultContext}>{children}</SummaryContext.Provider>;
};
