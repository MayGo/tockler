import * as React from 'react';
import moment from 'moment';
import { TrackItemService } from './services/TrackItemService';
import { setDayFromTimerange, getTodayTimerange } from './components/Timeline/timeline.utils';
import { useWindowFocused } from './hooks/windowFocusedHook';
import { useInterval } from './hooks/intervalHook';
import { addToTimelineItems } from './timeline.util';

export const TimelineContext = React.createContext<any>({});

const emptyTimeItems = {
    appItems: [],
    logItems: [],
    statusItems: [],
};

export const TimelineProvider = ({ children }) => {
    const [isLoading, setIsLoading] = React.useState<any>(true);
    const [timerange, setTimerange] = React.useState<any>(getTodayTimerange());
    const [lastRequestTime, setLastRequestTime] = React.useState<any>(moment());
    const [visibleTimerange, setVisibleTimerange] = React.useState<any>([
        moment().subtract(1, 'hour'),
        moment().add(1, 'hour'),
    ]);

    const [timeItems, setTimeItems] = React.useState<any>(emptyTimeItems);
    const { windowIsActive } = useWindowFocused();

    const loadTimerange = async timerange => {
        console.info('Loading timerange:', JSON.stringify(timerange));
        setIsLoading(true);
        const { appItems, statusItems, logItems } = await TrackItemService.findAllItems(
            timerange[0],
            timerange[1],
        );

        setTimeItems({ appItems, statusItems, logItems });
        setTimerange(timerange);
        setVisibleTimerange(setDayFromTimerange(visibleTimerange, timerange));
        setIsLoading(false);
    };

    const defaultContext = {
        timerange,
        setTimerange,
        timeItems,
        setTimeItems,
        loadTimerange,
        visibleTimerange,
        setVisibleTimerange,
        isLoading,
    };

    React.useEffect(() => {
        loadTimerange(timerange);
    }, []);

    const bgSync = async requestFrom => {
        console.debug('Requesting from:', JSON.stringify(requestFrom));
        const { appItems, statusItems, logItems } = await TrackItemService.findAllItems(
            requestFrom,
            moment(requestFrom).add(1, 'days'),
        );
        console.debug('Returned updated items:', appItems);

        setTimeItems(addToTimelineItems(timeItems, { appItems, statusItems, logItems }));
    };

    const delayMs = 3000;
    useInterval(() => {
        if (windowIsActive) {
            if (moment(lastRequestTime).isBetween(timerange[0], timerange[1])) {
                bgSync(lastRequestTime);
                setLastRequestTime(moment());
            } else {
                console.debug('Current day not selected in UI, not requesting data');
            }
        } else {
            console.debug('Window not active, not running query');
        }
    }, [delayMs]);

    return <TimelineContext.Provider value={defaultContext}>{children}</TimelineContext.Provider>;
};
