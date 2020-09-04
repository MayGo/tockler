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

// also caping return values with actual timerange
const getCenteredTimerange = (timerange, visibleTimerange, middleTime) => {
    const timeBetweenMs = moment(visibleTimerange[1]).diff(visibleTimerange[0]);
    const middlePoint = timeBetweenMs / 5;

    let beginDate = moment(middleTime).subtract(timeBetweenMs - middlePoint, 'milliseconds');
    let endDate = moment(middleTime).add(middlePoint, 'milliseconds');

    // if new beginDate is smaller than actual timerange, then cap it with timeranges beginDate
    const underTime = moment(timerange[0]).diff(beginDate);
    if (underTime > 0) {
        beginDate = moment(timerange[0]);
        endDate = moment(endDate).add(underTime, 'milliseconds');
    }

    // if new endDate is bigger than actual timeranges endDate, then cap it with timeranges endDate
    const overTime = moment(endDate).diff(timerange[1]);
    if (overTime > 0) {
        endDate = moment(timerange[1]);
        beginDate = moment(beginDate).subtract(overTime, 'milliseconds');

        //edge case, if we have 23h visible timerange, then cap it with timeranges beginDate
        if (moment(timerange[0]).diff(beginDate) > 0) {
            beginDate = moment(timerange[0]);
        }
    }

    return [beginDate, endDate];
};

export const TimelineProvider = ({ children }) => {
    const defaultTimerange = getTodayTimerange();
    const defaultVisibleTimerange = getCenteredTimerange(
        defaultTimerange,
        [moment().subtract(1, 'hour'), moment().add(1, 'hour')],
        moment(),
    );
    const [liveView, setLiveView] = useState<any>(true);
    const [isLoading, setIsLoading] = useState<any>(true);
    const [timerange, setTimerange] = useState<any>(defaultTimerange);
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
        async range => {
            let mode;
            if (moment().isBetween(range[0], range[1])) {
                mode = TIMERANGE_MODE_TODAY;
            }
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
        liveView,
        setLiveView,
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
            if (timerangeMode === TIMERANGE_MODE_TODAY && liveView) {
                bgSync(lastRequestTime);
                setLastRequestTime(moment());

                setVisibleTimerange(
                    getCenteredTimerange(timerange, visibleTimerange, lastRequestTime),
                );

                if (lastRequestTime.day() !== timerange[1].day()) {
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
