import { VStack } from '@chakra-ui/react';
import { StackDivider } from '@chakra-ui/react';
import { groupBy, map, orderBy, sortBy, sumBy } from 'lodash';
import { memo } from 'react';
import { convertDate } from '../../constants';
import { Loader } from '../Timeline/Loader';

import { TrayListItem } from './TrayListItem';

const sumDiff = (data) => sumBy(data, (c: any) => convertDate(c.endDate).diff(convertDate(c.beginDate)));

const aggregateSameAppAndName = (lastLogItems, runningLogItem) => {
    const grouped = groupBy(lastLogItems, (item) => `${item.app}_${item.title}`);

    const mapped = map(grouped, (items) => {
        return {
            app: items[0].app,
            title: items[0].title,
            color: items[0].color,
            isRunning: runningLogItem ? !!items.find((item) => item.id === runningLogItem.id) : false,
            beginDate: sortBy(items, ['beginDate'])[0].beginDate,
            endDate: sortBy(items, ['endDate'])[items.length - 1].endDate,
            totalMs: sumDiff(items),
        };
    });

    return mapped;
};

export function TrayListPlain({ lastLogItems, loading, runningLogItem, stopRunningLogItem, startNewLogItem }: any) {
    const aggrItems = aggregateSameAppAndName(lastLogItems, runningLogItem);
    let items = orderBy(aggrItems, ['isRunning', 'endDate'], ['desc', 'desc']);

    return (
        <VStack spacing={1} align="stretch" divider={<StackDivider borderColor="gray.200" />} position="relative">
            {loading && <Loader />}
            {items.map((item) => (
                <TrayListItem
                    key={item.title}
                    item={item}
                    startNewLogItemFromOld={startNewLogItem}
                    stopRunningLogItem={stopRunningLogItem}
                />
            ))}
        </VStack>
    );
}

export const TrayList = memo(TrayListPlain);
