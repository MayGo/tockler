import { memo } from 'react';
import { filterItems } from '../Timeline/timeline.utils';

import { HStack } from '@chakra-ui/react';
import { maxBy, minBy } from 'lodash';
import { DateTime } from 'luxon';
import { ITrackItem } from '../../@types/ITrackItem';
import { TIME_FORMAT_SHORT } from '../../constants';
import { TrackItemType } from '../../enum/TrackItemType';
import { useStoreState } from '../../store/easyPeasy';
import { secondsToClock } from '../../time.util';
import { MakeUnitSmaller } from '../MakeUnitSmaller';
import { Metric } from '../Metric';
import { MetricTile } from '../MetricTile';
import { getOnlineTime, getTasksTime } from './MetricTiles.utils';

const NO_VALUE = '-';

const EMPTY_ARRAY: ITrackItem[] = [];

export const MetricTiles = memo(() => {
    const timeItems = useStoreState((state) => state.timeItems);
    const timerange = useStoreState((state) => state.timerange);
    const visibleTimerange = useStoreState((state) => state.visibleTimerange);

    const logItems = filterItems(timeItems[TrackItemType.LogTrackItem] || EMPTY_ARRAY, visibleTimerange);

    const onlineItems =
        timeItems[TrackItemType.StatusTrackItem]?.filter((item) => item.app === 'ONLINE') || EMPTY_ARRAY;

    //
    const onlineTotal = getOnlineTime(onlineItems, timerange);
    const onlineTotalVisible = getOnlineTime(filterItems(onlineItems, visibleTimerange), visibleTimerange);
    const tasksTotal = getTasksTime(timeItems[TrackItemType.LogTrackItem] || EMPTY_ARRAY, timerange);
    const tasksTotalVisible = getTasksTime(logItems, visibleTimerange);

    const wakeItem: ITrackItem | undefined = minBy(onlineItems, (c: ITrackItem) => c.beginDate);
    const sleepItem: ITrackItem | undefined = maxBy(onlineItems, (c: ITrackItem) => c.endDate);

    return (
        <HStack flex={1} mr={8}>
            <MetricTile>
                <Metric
                    title="Online"
                    value={<MakeUnitSmaller>{secondsToClock(onlineTotal / 1000, 0, 2)}</MakeUnitSmaller>}
                />
                <Metric
                    title="Selected range"
                    value={
                        <MakeUnitSmaller>{secondsToClock(onlineTotalVisible / 1000, 0, 2) || NO_VALUE}</MakeUnitSmaller>
                    }
                />
            </MetricTile>
            <MetricTile>
                <Metric
                    title="Tasks"
                    value={<MakeUnitSmaller>{secondsToClock(tasksTotal / 1000, 0, 2) || NO_VALUE}</MakeUnitSmaller>}
                />
                <Metric
                    title="Selected range"
                    value={
                        <MakeUnitSmaller>{secondsToClock(tasksTotalVisible / 1000, 0, 2) || NO_VALUE}</MakeUnitSmaller>
                    }
                />
            </MetricTile>
            <MetricTile>
                <Metric
                    title="First online"
                    value={wakeItem ? DateTime.fromMillis(wakeItem.beginDate).toFormat(TIME_FORMAT_SHORT) : NO_VALUE}
                />
                <Metric
                    title="Last online"
                    value={sleepItem ? DateTime.fromMillis(sleepItem.endDate).toFormat(TIME_FORMAT_SHORT) : NO_VALUE}
                />
            </MetricTile>
        </HStack>
    );
});
