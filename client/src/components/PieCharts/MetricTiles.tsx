import React, { memo, useContext } from 'react';
import { RootContext } from '../../RootContext';
import { filterItems } from '../Timeline/timeline.utils';

import { useStoreState } from '../../store/easyPeasy';
import { HStack } from '@chakra-ui/react';
import { MetricTile } from '../MetricTile';
import { Metric } from '../Metric';
import { convertDate, TIME_FORMAT_SHORT } from '../../constants';
import { secondsToClock } from '../../time.util';
import { MakeUnitSmaller } from '../MakeUnitSmaller';
import { maxBy, minBy } from 'lodash';
import moment from 'moment';
import { TrackItemType } from '../../enum/TrackItemType';
import { ITrackItem } from '../../@types/ITrackItem';

const sumApp = (timeDiffInMs, item) => {
    return timeDiffInMs + convertDate(item.endDate).diff(convertDate(item.beginDate));
};

const getOnlineTime = items => {
    const onlineItems = items.filter(item => item.app === 'ONLINE');
    return onlineItems.reduce(sumApp, 0);
};
const getTasksTime = items => {
    return items.reduce(sumApp, 0);
};

const NO_VALUE = '-';

export const MetricTiles = memo(() => {
    const timeItems = useStoreState(state => state.timeItems);
    const visibleTimerange = useStoreState(state => state.visibleTimerange);

    const { workSettings } = useContext(RootContext);

    const appItems = filterItems(timeItems.appItems, visibleTimerange);
    const statusItems = filterItems(timeItems.statusItems, visibleTimerange);
    const logItems = filterItems(timeItems.logItems, visibleTimerange);

    const onlineItems = timeItems.statusItems.filter(item => item.app === 'ONLINE');

    const onlineTotal = getOnlineTime(onlineItems);
    const onlineTotalVisible = getOnlineTime(filterItems(onlineItems, visibleTimerange));
    const tasksTotal = getTasksTime(timeItems.logItems);
    const tasksTotalVisible = getTasksTime(logItems);

    const wakeItem: ITrackItem | undefined = minBy(onlineItems, (c: ITrackItem) => c.beginDate);
    const sleepItem: ITrackItem | undefined = maxBy(onlineItems, (c: ITrackItem) => c.endDate);

    return (
        <HStack flex={1} mr={8}>
            <MetricTile>
                <Metric
                    title="Online"
                    value={
                        <MakeUnitSmaller>
                            {secondsToClock(onlineTotal / 1000, 0, 2)}
                        </MakeUnitSmaller>
                    }
                />
                <Metric
                    title="Selected range"
                    value={
                        <MakeUnitSmaller>
                            {secondsToClock(onlineTotalVisible / 1000, 0, 2) || NO_VALUE}
                        </MakeUnitSmaller>
                    }
                />
            </MetricTile>
            <MetricTile>
                <Metric
                    title="Tasks"
                    value={
                        <MakeUnitSmaller>
                            {secondsToClock(tasksTotal / 1000, 0, 2) || NO_VALUE}
                        </MakeUnitSmaller>
                    }
                />
                <Metric
                    title="Selected range"
                    value={
                        <MakeUnitSmaller>
                            {secondsToClock(tasksTotalVisible / 1000, 0, 2) || NO_VALUE}
                        </MakeUnitSmaller>
                    }
                />
            </MetricTile>
            <MetricTile>
                <Metric
                    title="First online"
                    value={
                        wakeItem ? moment(wakeItem.beginDate).format(TIME_FORMAT_SHORT) : NO_VALUE
                    }
                />
                <Metric
                    title="Last online"
                    value={
                        sleepItem ? moment(sleepItem.endDate).format(TIME_FORMAT_SHORT) : NO_VALUE
                    }
                />
            </MetricTile>
        </HStack>
    );
});
