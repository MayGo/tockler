import moment from 'moment';
import React, { createContext, useState, useCallback, useEffect } from 'react';
import { getTodayTimerange, setDayFromTimerange } from './components/Timeline/timeline.utils';
import { useInterval } from './hooks/intervalHook';
import { findAllDayItemsForEveryTrack } from './services/trackItem.api';
import { addToTimelineItems } from './timeline.util';
import { Logger } from './logger';

export const TimelineContext = createContext<any>({});

const emptyTimeItems = {
    appItems: [],
    logItems: [],
    statusItems: [],
};

export const TIMERANGE_MODE_TODAY = 'TODAY';
const BG_SYNC_DELAY_MS = 3000;

const getCenteredTimerange = (currentTimerange, middleTime) => {
    const timeBetweenMs = moment(currentTimerange[1]).diff(moment(currentTimerange[0]));
    const middlePoint = timeBetweenMs / 5;

    const beginDate = moment(middleTime).subtract(timeBetweenMs - middlePoint, 'milliseconds');
    const endDate = moment(middleTime).add(middlePoint, 'milliseconds');

    return [beginDate, endDate];
};

export const TimelineProvider = ({ children }) => {
    const defaultVisibleTimerange = getCenteredTimerange(
        [moment().subtract(1, 'hour'), moment().add(1, 'hour')],
        moment(),
    );
    const [isLoading, setIsLoading] = useState<any>(true);
    const [timerange, setTimerange] = useState<any>(getTodayTimerange());
    const [timerangeMode, setTimerangeMode] = useState(TIMERANGE_MODE_TODAY);
    const [lastRequestTime, setLastRequestTime] = useState<any>(moment());
    const [visibleTimerange, setVisibleTimerange] = useState<any>(defaultVisibleTimerange);

    const [timeItems, setTimeItems] = useState<any>(emptyTimeItems);

    const fetchTimerange = useCallback(async () => {
        Logger.debug('Loading timerange:', JSON.stringify(timerange));
        setIsLoading(true);
        const { appItems, statusItems, logItems } = await findAllDayItemsForEveryTrack(
            timerange[0],
            timerange[1],
        );

        setTimeItems({ appItems, statusItems, logItems });
        setVisibleTimerange(setDayFromTimerange(visibleTimerange, timerange));
        setIsLoading(false);
    }, [visibleTimerange, timerange]);

    const loadTimerange = useCallback(
        async (range, mode) => {
            Logger.debug('loadTimerange:', JSON.stringify(range));
            setTimerange(range);
            setTimerangeMode(mode);
        },
        [setTimerange, setTimerangeMode],
    );

    const defaultContext = {
        timerange,
        setTimerange,
        timeItems,
        setTimeItems,
        loadTimerange,
        visibleTimerange,
        setVisibleTimerange,
        isLoading,
        timerangeMode,
        setTimerangeMode,
    };

    useEffect(() => {
        fetchTimerange();
    }, [timerange]); // eslint-disable-line react-hooks/exhaustive-deps

    const bgSync = async requestFrom => {
        Logger.debug('Requesting from:', JSON.stringify(requestFrom));
        const { appItems, statusItems, logItems } = await findAllDayItemsForEveryTrack(
            requestFrom,
            moment(requestFrom).add(1, 'days'),
        );
        Logger.debug('Returned updated items:', appItems);

        setTimeItems(addToTimelineItems(timeItems, { appItems, statusItems, logItems }));
    };

    useInterval(() => {
        if (!isLoading) {
            if (timerangeMode === TIMERANGE_MODE_TODAY) {
                bgSync(lastRequestTime);
                setLastRequestTime(moment());

                setVisibleTimerange(getCenteredTimerange(visibleTimerange, lastRequestTime));

                if (lastRequestTime.day() !== timerange[0].day()) {
                    Logger.debug('Day changed. Setting today as timerange.');
                    setTimerange(getTodayTimerange());
                }
            } else {
                // Logger.debug('Current day not selected in UI, not requesting data');
            }
        } else {
            Logger.debug('Delaying bg sync, initial data still loading.');
        }
    }, [BG_SYNC_DELAY_MS]);

    return <TimelineContext.Provider value={defaultContext}>{children}</TimelineContext.Provider>;
};
