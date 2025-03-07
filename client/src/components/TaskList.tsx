import _ from 'lodash';

import { Box, HStack, Text } from '@chakra-ui/react';
import { useStoreState } from '../store/easyPeasy';
import { sumAppObject, SumItem } from './PieCharts/MetricTiles.utils';
import { filterItems } from './Timeline/timeline.utils';

import { TrackItemType } from '../enum/TrackItemType';
import { shortTime } from '../time.util';

export const TaskList = () => {
    const timeItems = useStoreState((state) => state.timeItems);
    const timerange = useStoreState((state) => state.timerange);

    const logItems = filterItems(timeItems[TrackItemType.LogTrackItem] || [], timerange);

    const groupByField = 'app';

    const data = _(logItems)
        .groupBy(groupByField)
        .map((b) => {
            return b.reduce(sumAppObject(timerange), {
                app: b[0].app,
                title: b[0].title,
                timeDiffInMs: 0,
                color: b[0].color,
            } as SumItem);
        })
        .valueOf();

    return (
        <>
            {data.map(({ app, title, color, timeDiffInMs }) => {
                return (
                    <HStack alignItems="center" pb={2} minWidth="0" spacing={4} key={`${app}_${title}`}>
                        <Box bg={color} w="8px" h="8px" minWidth="8px" borderRadius="full" />

                        <Text fontWeight="bold" fontSize="md">
                            {app}
                        </Text>

                        <Text fontSize="md" minWidth="0">
                            {title}
                        </Text>
                        <Text fontSize="md" minWidth="0" fontWeight="bold">
                            {shortTime(timeDiffInMs)}
                        </Text>
                    </HStack>
                );
            })}
        </>
    );
};
